'use strict';
var __assign =
  (this && this.__assign) ||
  function() {
    __assign =
      Object.assign ||
      function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function(resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = {next: verb(0), throw: verb(1), return: verb(2)}),
      typeof Symbol === 'function' &&
        (g[Symbol.iterator] = function() {
          return this;
        }),
      g
    );
    function verb(n) {
      return function(v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError('Generator is already executing.');
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y['return']
                  : op[0]
                  ? y['throw'] || ((t = y['return']) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return {value: op[1], done: false};
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return {value: op[0] ? op[1] : void 0, done: true};
    }
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var express_1 = __importDefault(require('express'));
var multer_1 = __importDefault(require('multer'));
var error_handler_1 = __importDefault(require('./utils/error-handler'));
var fs_extra_1 = __importDefault(require('fs-extra'));
var zip_utils_1 = require('./utils/zip-utils');
var async_middleware_1 = __importDefault(require('./utils/async-middleware'));
var body_parser_1 = __importDefault(require('body-parser'));
var string_utils_1 = require('./utils/string-utils');
var os_1 = require('os');
var cmd_utils_1 = require('./utils/cmd-utils');
var http_1 = __importDefault(require('http'));
var socket_io_1 = __importDefault(require('socket.io'));
var ShipperServer = /** @class */ (function() {
  function ShipperServer(configPath) {
    if (configPath === void 0) {
      configPath = '/usr/local/etc/shipper';
    }
    this.configPath = configPath;
    this.config = ShipperServer.getDefaultConfig();
    this.sockets = {};
    this.expressApp = express_1.default();
    this.server = new http_1.default.Server(this.expressApp);
    this.io = socket_io_1.default(this.server);
    this.defineRoutes();
    this.configFile = configPath + '/shipper-server.json';
    this.init();
    this.loadConfig();
    this.setupSocket();
  }
  ShipperServer.prototype.init = function() {
    try {
      fs_extra_1.default.ensureDirSync(this.configPath);
    } catch (e) {
      console.log(e.message);
    }
    var data = JSON.stringify(ShipperServer.getDefaultConfig(), null, 2);
    try {
      fs_extra_1.default.writeFileSync(this.configFile, data, {flag: 'wx'});
    } catch (e) {}
  };
  ShipperServer.prototype.setupSocket = function() {
    var _this = this;
    this.io.on('connection', function(socket) {
      _this.sockets[socket.id] = socket;
      socket.on('disconnect', function() {
        delete _this.sockets[socket.id];
      });
    });
  };
  ShipperServer.prototype.getProjectSocket = function(projectName) {
    for (var _i = 0, _a = Object.keys(this.sockets); _i < _a.length; _i++) {
      var id = _a[_i];
      var socket = this.sockets[id];
      if (socket && socket.handshake.query.projectName === projectName) {
        return socket;
      }
    }
    return null;
  };
  ShipperServer.prototype.defineRoutes = function() {
    var _this = this;
    var storage = multer_1.default.diskStorage({
      destination: function(req, file, cb) {
        fs_extra_1.default.ensureDirSync('/tmp/my-uploads');
        cb(null, '/tmp/my-uploads');
      },
      filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
      },
    });
    var upload = multer_1.default({storage: storage});
    this.expressApp.use(body_parser_1.default.urlencoded({extended: true}));
    this.expressApp.use(body_parser_1.default.json());
    this.expressApp.post(
      '/upload/:projectName',
      this.authenticate.bind(this),
      upload.single('file'),
      async_middleware_1.default(function(req, res) {
        return __awaiter(_this, void 0, void 0, function() {
          var _a, preDeployCmd, postDeployCmd, _b, path, stdout;
          return __generator(this, function(_c) {
            switch (_c.label) {
              case 0:
                (_a = req.body || {}),
                  (preDeployCmd = _a.preDeployCmd),
                  (postDeployCmd = _a.postDeployCmd);
                (_b = (this.getProject(req.params.projectName) || {}).path),
                  (path = _b === void 0 ? '' : _b);
                return [4 /*yield*/, this.upload(req.file, path)];
              case 1:
                _c.sent();
                return [
                  4 /*yield*/,
                  this.install(
                    path,
                    preDeployCmd,
                    postDeployCmd,
                    req.params.projectName,
                  ),
                ];
              case 2:
                stdout = _c.sent();
                return [
                  2 /*return*/,
                  res.json({message: 'Done!', stdout: stdout}),
                ];
            }
          });
        });
      }),
    );
    this.expressApp.get('/ping', function(req, res) {
      return res.json({message: 'Hello World!'});
    });
    this.expressApp.use(error_handler_1.default);
  };
  ShipperServer.prototype.upload = function(file, projectPath) {
    return __awaiter(this, void 0, void 0, function() {
      var zipFilePath, e_1;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            zipFilePath = projectPath + '_tmp.zip';
            // get project settings by id and token
            try {
              // remove old zip
              fs_extra_1.default.unlinkSync(zipFilePath);
            } catch (e) {
              console.log(e.message);
            }
            fs_extra_1.default.moveSync(file.path, zipFilePath);
            _a.label = 1;
          case 1:
            _a.trys.push([1, 3, , 4]);
            return [
              4 /*yield*/,
              zip_utils_1.unzipFile(zipFilePath, projectPath + '_tmp'),
            ];
          case 2:
            _a.sent();
            return [3 /*break*/, 4];
          case 3:
            e_1 = _a.sent();
            console.log(e_1.message);
            return [3 /*break*/, 4];
          case 4:
            try {
              fs_extra_1.default.unlinkSync(zipFilePath);
            } catch (e) {}
            return [2 /*return*/];
        }
      });
    });
  };
  ShipperServer.prototype.install = function(
    projectPath,
    preDeployCmd,
    postDeployCmd,
    projectName,
  ) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function() {
      var socket, e_2;
      return __generator(this, function(_c) {
        switch (_c.label) {
          case 0:
            socket = this.getProjectSocket(projectName);
            if (!(preDeployCmd && fs_extra_1.default.existsSync(projectPath)))
              return [3 /*break*/, 4];
            _c.label = 1;
          case 1:
            _c.trys.push([1, 3, , 4]);
            (_a = socket) === null || _a === void 0
              ? void 0
              : _a.emit('data', {stdout: '> ' + preDeployCmd + '\n'});
            return [
              4 /*yield*/,
              cmd_utils_1.spawnCmd(
                preDeployCmd,
                function(stdout) {
                  var _a;
                  (_a = socket) === null || _a === void 0
                    ? void 0
                    : _a.emit('data', {stdout: stdout});
                },
                {cwd: projectPath},
              ),
            ];
          case 2:
            _c.sent();
            return [3 /*break*/, 4];
          case 3:
            e_2 = _c.sent();
            console.log(e_2.message);
            return [3 /*break*/, 4];
          case 4:
            try {
              // delete old
              fs_extra_1.default.removeSync(projectPath);
            } catch (e) {
              console.log(e.message);
            }
            // install new
            fs_extra_1.default.moveSync(projectPath + '_tmp', projectPath);
            if (!postDeployCmd) return [3 /*break*/, 6];
            (_b = socket) === null || _b === void 0
              ? void 0
              : _b.emit('data', {stdout: '> ' + postDeployCmd + '\n'});
            return [
              4 /*yield*/,
              cmd_utils_1.spawnCmd(
                postDeployCmd,
                function(stdout) {
                  var _a;
                  (_a = socket) === null || _a === void 0
                    ? void 0
                    : _a.emit('data', {stdout: stdout});
                },
                {cwd: projectPath},
              ),
            ];
          case 5:
            _c.sent();
            _c.label = 6;
          case 6:
            return [2 /*return*/];
        }
      });
    });
  };
  ShipperServer.prototype.authenticate = function(req, res, next) {
    return __awaiter(this, void 0, void 0, function() {
      var authorization, projectName, _a, name, token, path;
      return __generator(this, function(_b) {
        authorization = req.headers.authorization;
        projectName = req.params.projectName;
        (_a = this.getProject(projectName) || {}),
          (name = _a.name),
          (token = _a.token),
          (path = _a.path);
        if (!path || !projectName || projectName !== name) {
          return [
            2 /*return*/,
            res.status(404).send({message: 'Project not found'}),
          ];
        }
        if (authorization && authorization !== token) {
          return [
            2 /*return*/,
            res.status(401).send({message: 'Invalid token'}),
          ];
        }
        next();
        return [2 /*return*/];
      });
    });
  };
  ShipperServer.prototype.getProject = function(projectName) {
    return this.config.projects.find(function(project) {
      return project.name === projectName;
    });
  };
  ShipperServer.prototype.getExpressApp = function() {
    return this.expressApp;
  };
  ShipperServer.prototype.start = function(port) {
    if (port === void 0) {
      port = 4040;
    }
    this.server.listen(port, function() {
      console.log('Shipper Server listening on port: ' + port);
    });
  };
  ShipperServer.prototype.loadConfig = function() {
    try {
      var data = fs_extra_1.default.readFileSync(this.configFile);
      var newConfig = JSON.parse(data.toString());
      this.config = __assign({}, newConfig);
    } catch (e) {
      this.config = ShipperServer.getDefaultConfig();
    }
  };
  ShipperServer.getDefaultConfig = function() {
    return {
      projects: [],
    };
  };
  ShipperServer.prototype.createProject = function(projectName, projectsPath) {
    if (projectsPath === void 0) {
      projectsPath = os_1.homedir() + '/shipper-projects';
    }
    var path = projectsPath + '/' + projectName;
    if (this.getProjectByPath(path)) {
      throw new Error('the project already exists');
    }
    var project = {
      name: projectName,
      path: path,
      token: string_utils_1.generateToken(),
    };
    this.config.projects.push(project);
    // fs.ensureDirSync(project.path);
    this.saveConfig();
    return project;
  };
  ShipperServer.prototype.saveConfig = function() {
    var data = JSON.stringify(this.config, null, 2);
    try {
      fs_extra_1.default.writeFileSync(this.configFile, data, {flag: 'w'});
    } catch (e) {
      console.log(e.message);
    }
  };
  ShipperServer.prototype.getProjects = function() {
    return this.config.projects;
  };
  ShipperServer.prototype.getProjectByPath = function(path) {
    return this.config.projects.find(function(item) {
      return item.path === path;
    });
  };
  ShipperServer.prototype.deleteProject = function(name) {
    var path = (this.getProject(name) || {}).path;
    if (path) {
      try {
        fs_extra_1.default.removeSync(path);
      } catch (e) {
        console.log(e.message);
      }
    }
    var index = this.config.projects.findIndex(function(item) {
      return item.name === name;
    });
    this.config.projects.splice(index, 1);
    this.saveConfig();
  };
  return ShipperServer;
})();
exports.default = ShipperServer;
