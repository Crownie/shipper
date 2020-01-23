import fs from 'fs-extra';
import {copyFolderRecursive} from './utils/copy';
import NodeSsh from 'node-ssh';
import Rsync from 'rsync';
import {rsyncExecutePromise} from './utils/promise-utils';

const ssh = new NodeSsh();

export default class Shipper {
  private config: ShipperConfig = Shipper.getDefaultConfig();
  private readonly configFile;

  private get tmpFolder() {
    return `${this.configPath}/.tmp`;
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

  constructor(private configPath: string = process.cwd()) {
    this.configFile = configPath + '/shipper.json';
    this.loadConfig();
  }

  init() {
    console.log(this.configPath);
    const data = JSON.stringify(Shipper.getDefaultConfig(), null, 2);
    try {
      fs.writeFileSync(this.configFile, data, {flag: 'wx'});
    } catch (e) {
      if (e) {
      } else {
        console.log('created file shipper.json');
      }
    }
  }

  async deploy() {
    console.log(this.configPath);
    await this.copyToTmp();
    await this.uploadTmp();
  }

  private async uploadTmp() {
    // connect to ssh
    await ssh.connect(this.config.connection);
    await ssh.execCommand(
      `rm -rf ${this.remoteTmpFolder} && mkdir -p ${this.remoteTmpFolder}`,
      {cwd: this.config.remoteRootFolder},
    );

    // upload contents of .tmp
    const rsync = new Rsync()
      .shell('ssh')
      .flags('avz')
      .source(this.tmpFolder + '/')
      .destination(this.sshDestination + '/')
      .set('e', `ssh -i ${this.config.connection.privateKey}`);
    await rsyncExecutePromise(rsync);

    // commands
    const removeOldCmd = `rm -rf ${this.remoteOldFolder}`;
    const backupCmd = `mv ${this.remoteFolder} ${this.remoteOldFolder}`;
    const installCmd = `mv ${this.remoteTmpFolder} ${this.remoteFolder}`;

    // remove previous backup
    await ssh.execCommand(removeOldCmd, {
      cwd: this.config.remoteRootFolder,
    });

    // create new backup
    await ssh.execCommand(backupCmd, {
      cwd: this.config.remoteRootFolder,
    });

    // install new
    await ssh.execCommand(installCmd, {
      cwd: this.config.remoteRootFolder,
    });

    // close connection
    ssh.dispose();
  }

  /**
   * copy specified files in @code{this.config} to .tmp folder
   */
  private async copyToTmp() {
    console.log(this.config);
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
          console.log('cannot copy to ' + this.tmpFolder, e);
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
}
