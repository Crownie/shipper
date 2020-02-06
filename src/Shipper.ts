import fs from 'fs-extra';
import {copyFolderRecursive} from './utils/copy';
import {zipDirectory} from './utils/zip-utils';
import axios from 'axios';
import FormData from 'form-data';
import ora from 'ora';
import io from 'socket.io-client';

export default class Shipper {
  private config: ShipperConfig = Shipper.getDefaultConfig();
  private readonly configFile;

  private get tmpFolder() {
    return `${this.configPath}/.tmp`;
  }

  private get tmpZipFile() {
    return `${this.configPath}/.tmp.zip`;
  }

  constructor(private configPath: string = process.cwd()) {
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
    await this.removeZip();
  }

  private validateConfig() {
    if (!this.config) {
      throw new Error('Config is required');
    }
    if (!this.config.token) {
      throw new Error('config.token is required');
    }
    if (!this.config.projectName) {
      throw new Error('config.projectName is required');
    }
  }

  private async uploadTmp() {
    const spinner = ora('Uploading...').start();
    const file = fs.createReadStream(this.tmpZipFile);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preDeployCmd', this.config.preDeployCmd || '');
    formData.append('postDeployCmd', this.config.postDeployCmd || '');
    const url = `${this.config.host}/upload/${this.config.projectName}`;

    try {
      const socket = io.connect(this.config.host, {
        query: {projectName: this.config.projectName},
      });
      // report status during deployment
      socket.on('data', ({stdout}) => {
        spinner.stop();
        console.log(stdout);
      });

      await axios.post(url, formData, {
        headers: {
          Authorization: this.config.token,
          ...formData.getHeaders(),
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          console.log(percentCompleted);
        },
      });
      console.log('\n ✅  Deployed Successfully! 🎉');
    } catch (e) {
      spinner.stop();
      await Shipper.removeFolder(this.tmpFolder);
      console.log(e.response);
      console.log(e.response?.data);
    }
  }

  /**
   * copy specified files in @code{this.config} to .tmp folder
   */
  private async copyToTmp() {
    if (this.config) {
      await Shipper.removeFolder(this.tmpFolder);
      fs.mkdirSync(this.tmpFolder);
      if (this.config.files.length === 0) {
        throw new Error('no files or folders specified. See shipper.json');
      }
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

  private async removeZip() {
    try {
      await fs.unlinkSync(this.tmpZipFile);
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
      token: '',
      host: '',
      files: [],
      preDeployCmd: '',
      postDeployCmd: '',
    };
  }
}

export interface ShipperConfig {
  projectName: string;
  token: string;
  host: string;
  files: string[];
  preDeployCmd?: string;
  postDeployCmd?: string;
}
