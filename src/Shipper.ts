import fs from 'fs-extra';
import {copyFolderRecursive} from './utils/copy';
import {delay} from './utils/promise-utils';
import ora from 'ora';
import Ssh from './Ssh';
import RsyncHelper from './RsyncHelper';
import {zipDirectory} from './utils/zip-utils';

export default class Shipper {
  private config: ShipperConfig = Shipper.getDefaultConfig();
  private readonly configFile;

  private get tmpFolder() {
    return `${this.configPath}/.tmp`;
  }

  private get tmpZipFile() {
    return `${this.configPath}/.tmp.zip`;
  }

  private get remoteFolder() {
    return `${this.config.remoteRootFolder}/${this.config.projectName}`;
  }

  private get remoteTmpFolder() {
    return `${this.remoteFolder}_tmp`;
  }

  private get remoteOldFolder() {
    return `${this.remoteFolder}_old`;
  }

  private get sshDestination() {
    const {username, host} = this.config.connection;
    return `${username}@${host}:${this.remoteTmpFolder}`;
  }

  constructor(
    private configPath: string = process.cwd(),
    private ssh: Ssh = new Ssh(),
    private rsyncHelper: RsyncHelper = new RsyncHelper(),
  ) {
    this.configFile = configPath + '/shipper.json';
    this.loadConfig();
  }

  init() {
    const data = JSON.stringify(Shipper.getDefaultConfig(), null, 2);
    try {
      fs.writeFileSync(this.configFile, data, {flag: 'wx'});
      console.log('created file shipper.json');
    } catch (e) {
      console.log('shipper.json already exists');
    }
  }

  async deploy() {
    this.validateConfig();
    await this.copyToTmp();
    await zipDirectory(this.tmpFolder, this.tmpZipFile);
    await this.uploadTmp();
  }

  private validateConfig() {
    if (!this.config) {
      throw new Error('Config is required');
    }
    if (!this.config.connection) {
      throw new Error('config.connection is required');
    }
    if (!this.config.connection.host) {
      throw new Error('config.connection.host is required');
    }
    if (!this.config.connection.username) {
      throw new Error('config.connection.username is required');
    }
  }

  private async uploadTmp() {
    const spinner = ora('Connecting to server via ssh').start();

    // connect to ssh
    await this.ssh.connect(this.config.connection);
    await this.ssh.execCommand(
      `rm -rf ${this.remoteTmpFolder} && mkdir -p ${this.remoteTmpFolder}`,
      {cwd: this.config.remoteRootFolder},
    );

    // upload contents of .tmp
    spinner.text = 'Uploading files and folders';
    await this.rsyncHelper
      .start()
      .shell('ssh')
      .flags('avz')
      .source(this.tmpFolder + '/')
      .destination(this.sshDestination + '/')
      .set('e', `ssh -i ${this.config.connection.privateKey}`)
      .execute();

    // commands
    const removeOldCmd = `rm -rf ${this.remoteOldFolder}`;
    const backupCmd = `mv ${this.remoteFolder} ${this.remoteOldFolder}`;
    const installCmd = `mv ${this.remoteTmpFolder} ${this.remoteFolder}`;
    const cdInstallationDir = `cd ${this.remoteFolder}`;

    // remove previous backup
    console.log('\n', removeOldCmd);
    await this.ssh.execCommand(removeOldCmd, {
      cwd: this.config.remoteRootFolder,
    });

    // create new backup
    console.log('\n', backupCmd);
    await this.ssh.execCommand(backupCmd, {
      cwd: this.config.remoteRootFolder,
    });

    // install new
    console.log('\n', installCmd);
    await this.ssh.execCommand(installCmd, {
      cwd: this.config.remoteRootFolder,
    });

    // run post deploy command
    if (this.config.postDeployCmd) {
      spinner.text = `Running post deploy commands:`;
      await delay(1000);
      spinner.stop();
      console.log('\n', this.config.postDeployCmd);
      const {stdout, stderr} = await this.ssh.execCommand(
        `${cdInstallationDir} && ${this.config.postDeployCmd}`,
        {
          cwd: this.config.remoteRootFolder,
        },
      );
      console.log('\x1b[34m%s\x1b[0m', stdout);
      console.log('\x1b[31m%s\x1b[0m', stderr);
    }

    await Shipper.removeFolder(this.tmpFolder);

    // close connection
    this.ssh.dispose();

    console.log('\n ✅  Deployed Successfully! 🎉');
  }

  /**
   * copy specified files in @code{this.config} to .tmp folder
   */
  private async copyToTmp() {
    if (this.config) {
      await Shipper.removeFolder(this.tmpFolder);
      fs.mkdirSync(this.tmpFolder);
      for (const path of this.config.files) {
        try {
          await copyFolderRecursive(
            this.configPath + '/' + path,
            this.tmpFolder,
          );
        } catch (e) {
          throw e;
        }
      }
    }
  }

  private static async removeFolder(folder) {
    try {
      await fs.remove(folder);
    } catch (err) {
      console.error(err);
    }
  }

  public loadConfig() {
    try {
      const data = fs.readFileSync(this.configFile);
      const newConfig = JSON.parse(data.toString());
      this.config = {
        ...newConfig,
        connection: {
          ...newConfig.connection,
        },
      };
    } catch (e) {}
  }

  public static getDefaultConfig(): ShipperConfig {
    return {
      projectName: '',
      remoteRootFolder: '',
      files: [],
      connection: {
        host: 'localhost',
        username: 'sammy',
        port: 22,
        privateKey: '~/.ssh/id_rsa',
      },
    };
  }
}

export interface ShipperConfig {
  projectName: string;
  remoteRootFolder: string;
  files: string[];
  connection: {
    host: string;
    username: string;
    privateKey?: string;
    port?: number;
    password?: string;
    passphrase?: string; // the passphrase used for decrypting the private key
  };
  postDeployCmd?: string;
}
