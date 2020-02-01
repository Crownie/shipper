import express, {Express, NextFunction, Request, Response} from 'express';
import multer from 'multer';
import errorHandler from './utils/error-handler';
import fs from 'fs-extra';
import {unzipFile} from './utils/zip-utils';
import asyncMiddleware from './utils/async-middleware';
import bodyParser from 'body-parser';
import {generateToken} from './utils/string-utils';
import {homedir} from 'os';

export default class ShipperServer {
  private readonly server: Express;
  private readonly configFile: string;
  private config: ShipperServerConfig = ShipperServer.getDefaultConfig();

  constructor(private configPath = '/usr/local/etc/shipper') {
    this.server = express();
    this.defineRoutes();
    this.configFile = configPath + '/shipper-server.json';
    this.init();
    this.loadConfig();
  }

  init() {
    try {
      fs.ensureDirSync(this.configPath);
    } catch (e) {
      console.log(e.message);
    }
    const data = JSON.stringify(ShipperServer.getDefaultConfig(), null, 2);
    try {
      fs.writeFileSync(this.configFile, data, {flag: 'wx'});
    } catch (e) {}
  }

  protected defineRoutes() {
    const storage = multer.diskStorage({
      destination: function(req, file, cb) {
        fs.ensureDirSync('/tmp/my-uploads');
        cb(null, '/tmp/my-uploads');
      },
      filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
      },
    });
    const upload = multer({storage});

    this.server.use(bodyParser.urlencoded({extended: true}));
    this.server.use(bodyParser.json());
    this.server.post(
      '/upload/:projectName',
      this.authenticate.bind(this),
      upload.single('file'),
      asyncMiddleware(async (req: Request, res: Response) => {
        const {path = ''} = this.getProject(req.params.projectName) || {};
        await this.upload(req.file, path);
        this.install(path);
        return res.json({message: 'Hello World!'});
      }),
    );

    this.server.get('/ping', (req, res: Response) => {
      return res.json({message: 'Hello World!'});
    });

    this.server.use(errorHandler);
  }

  public async upload(file: Express.Multer.File, projectPath: string) {
    // get project settings by id and token
    try {
      fs.unlinkSync(projectPath + '/tmp.zip');
    } catch (e) {
      console.log(e.message);
    }
    fs.moveSync(file.path, projectPath + '/tmp.zip');
    try {
      await unzipFile(projectPath + '/tmp.zip', projectPath + '/tmp');
    } catch (e) {
      console.log(e.message);
    }
  }

  public install(projectPath: string) {
    try {
      fs.removeSync(projectPath + '/previous');
    } catch (e) {
      console.log(e.message);
    }
    try {
      // backup current
      fs.moveSync(projectPath + '/current', projectPath + '/previous');
    } catch (e) {
      console.log(e.message);
    }
    try {
      // install new
      fs.moveSync(projectPath + '/tmp', projectPath + '/current');
    } catch (e) {
      console.log(e.message);
    }
  }

  protected async authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const {authorization} = req.headers;
    const {projectName} = req.params;
    const {name, token, path} = this.getProject(projectName) || {};
    if (!path || !projectName || projectName !== name) {
      return res.status(404).send({message: 'Project not found'});
    }
    if (authorization && authorization !== token) {
      return res.status(401).send({message: 'Invalid token'});
    }
    next();
  }

  public getProject(projectName): ShipperProject | undefined {
    return this.config.projects.find((project) => project.name === projectName);
  }

  public getServer(): Express {
    return this.server;
  }

  public start(port: number = 3001) {
    this.server.listen(port, () => {
      console.log(`Shipper Server listening on port: ${port}`);
    });
  }

  public loadConfig() {
    try {
      const data = fs.readFileSync(this.configFile);
      const newConfig = JSON.parse(data.toString());
      this.config = {
        ...newConfig,
      };
    } catch (e) {}
  }

  public static getDefaultConfig(): ShipperServerConfig {
    return {
      projects: [],
    };
  }

  createProject(
    projectName: any,
    projectsPath = homedir() + '/shipper-projects',
  ) {
    const project = {
      name: projectName,
      path: projectsPath + '/' + projectName,
      token: generateToken(),
    };
    this.config.projects.push(project);
    // fs.ensureDirSync(project.path);
    this.saveConfig();
    return project;
  }

  public saveConfig() {
    const data = JSON.stringify(this.config, null, 2);
    try {
      fs.writeFileSync(this.configFile, data, {flag: 'w'});
    } catch (e) {
      console.log(e.message);
    }
  }

  getProjects(): ShipperProject[] {
    return this.config.projects;
  }

  deleteProject(name: string) {
    const {path} = this.getProject(name) || {};
    if (path) {
      try {
        fs.removeSync(path);
      } catch (e) {
        console.log(e.message);
      }
    }
    const index = this.config.projects.findIndex((item) => item.name === name);
    this.config.projects.splice(index, 1);
    this.saveConfig();
  }
}

interface ShipperServerConfig {
  projects: ShipperProject[];
}

interface ShipperProject {
  name: string;
  path: string;
  token: string;
}
