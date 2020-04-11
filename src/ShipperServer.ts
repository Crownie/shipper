import express, {Express, NextFunction, Request, Response} from 'express';
import multer from 'multer';
import errorHandler from './utils/error-handler';
import fs from 'fs-extra';
import {unzipFile} from './utils/zip-utils';
import asyncMiddleware from './utils/async-middleware';
import bodyParser from 'body-parser';
import {generateToken} from './utils/string-utils';
import {homedir} from 'os';
import {execCmd, spawnCmd} from './utils/cmd-utils';
import http from 'http';
import socketIo, {Server, Socket} from 'socket.io';

export default class ShipperServer {
  private readonly expressApp: Express;
  private readonly configFile: string;
  private config: ShipperServerConfig = ShipperServer.getDefaultConfig();
  private io: Server;
  private readonly server: http.Server;
  private sockets: {[key: string]: Socket} = {};

  constructor(private configPath = '/usr/local/etc/shipper') {
    this.expressApp = express();
    this.server = new http.Server(this.expressApp);
    this.io = socketIo(this.server);
    this.defineRoutes();
    this.configFile = configPath + '/shipper-server.json';
    this.init();
    this.loadConfig();
    this.setupSocket();
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

  private setupSocket() {
    this.io.on('connection', (socket) => {
      this.sockets[socket.id] = socket;
      socket.on('disconnect', () => {
        delete this.sockets[socket.id];
      });
    });
  }

  private getProjectSocket(projectName): Socket | null {
    for (let id of Object.keys(this.sockets)) {
      const socket = this.sockets[id];
      if (socket && socket.handshake.query.projectName === projectName) {
        return socket;
      }
    }
    return null;
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

    this.expressApp.use(bodyParser.urlencoded({extended: true}));
    this.expressApp.use(bodyParser.json());
    this.expressApp.post(
      '/upload/:projectName',
      this.authenticate.bind(this),
      upload.single('file'),
      asyncMiddleware(async (req: Request, res: Response) => {
        const {preDeployCmd, postDeployCmd} = req.body || {};
        const {path = ''} = this.getProject(req.params.projectName) || {};

        await this.upload(req.file, path);
        const stdout = await this.install(
          path,
          preDeployCmd,
          postDeployCmd,
          req.params.projectName,
        );
        return res.json({message: 'Done!', stdout});
      }),
    );

    this.expressApp.get('/ping', (req, res: Response) => {
      return res.json({message: 'Hello World!'});
    });

    this.expressApp.use(errorHandler);
  }

  public async upload(file: Express.Multer.File, projectPath: string) {
    const zipFilePath = projectPath + '_tmp.zip';
    // get project settings by id and token
    try {
      // remove old zip
      fs.unlinkSync(zipFilePath);
    } catch (e) {
      console.log(e.message);
    }
    fs.moveSync(file.path, zipFilePath);
    try {
      await unzipFile(zipFilePath, projectPath + '_tmp');
    } catch (e) {
      console.log(e.message);
    }

    try {
      fs.unlinkSync(zipFilePath);
    } catch (e) {}
  }

  public async install(
    projectPath: string,
    preDeployCmd: string,
    postDeployCmd: string,
    projectName: string,
  ) {
    const socket = this.getProjectSocket(projectName);
    if (preDeployCmd && fs.existsSync(projectPath)) {
      try {
        socket?.emit('data', {stdout: `> ${preDeployCmd}\n`});
        await spawnCmd(
          preDeployCmd,
          (stdout) => {
            socket?.emit('data', {stdout});
          },
          {cwd: projectPath},
        );
      } catch (e) {
        console.log(e.message);
      }
    }
    try {
      // delete old
      fs.removeSync(projectPath);
    } catch (e) {
      console.log(e.message);
    }

    // install new
    fs.moveSync(projectPath + '_tmp', projectPath);

    // run command
    if (postDeployCmd) {
      socket?.emit('data', {stdout: `> ${postDeployCmd}\n`});
      await spawnCmd(
        postDeployCmd,
        (stdout) => {
          socket?.emit('data', {stdout});
        },
        {cwd: projectPath},
      );
    }
  }

  protected async authenticate(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    this.loadConfig(); // load latest changes from shipper-server.json
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

  public getExpressApp(): Express {
    return this.expressApp;
  }

  public start(port: number = 4040) {
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
    } catch (e) {
      this.config = ShipperServer.getDefaultConfig();
    }
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
    const path = projectsPath + '/' + projectName;
    if (this.getProjectByPath(path)) {
      throw new Error('the project already exists');
    }
    const project = {
      name: projectName,
      path,
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

  getProjectByPath(path) {
    return this.config.projects.find((item) => item.path === path);
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
