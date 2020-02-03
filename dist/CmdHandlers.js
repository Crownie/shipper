'use strict';
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
var Shipper_1 = __importDefault(require('./Shipper'));
var ShipperServer_1 = __importDefault(require('./ShipperServer'));
var inquirer_1 = __importDefault(require('inquirer'));
var cmd_utils_1 = require('./utils/cmd-utils');
var chalk_1 = __importDefault(require('chalk'));
var kebabCase = require('lodash.kebabcase');
var shipper = new Shipper_1.default();
var shipperServer = new ShipperServer_1.default();
var CmdHandlers = /** @class */ (function() {
  function CmdHandlers() {}
  CmdHandlers.init = function(argv) {
    shipper.init();
    process.exit();
  };
  CmdHandlers.deploy = function(argv) {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, shipper.deploy()];
          case 1:
            _a.sent();
            process.exit();
            return [2 /*return*/];
        }
      });
    });
  };
  CmdHandlers.create = function() {
    var _this = this;
    {
      var beginQuestion_1 = function() {
        return __awaiter(_this, void 0, void 0, function() {
          var projectName, yes, shipperServer_1, _a, name_1, token, path;
          return __generator(this, function(_b) {
            switch (_b.label) {
              case 0:
                return [
                  4 /*yield*/,
                  inquirer_1.default.prompt([
                    {
                      type: 'input',
                      name: 'projectName',
                      message: 'Please provide a project name: ',
                      validate: function(answer) {
                        return answer.length >= 2;
                      },
                    },
                  ]),
                ];
              case 1:
                projectName = _b.sent().projectName;
                return [
                  4 /*yield*/,
                  inquirer_1.default.prompt([
                    {
                      type: 'confirm',
                      name: 'yes',
                      message:
                        'the following will be used: ' + kebabCase(projectName),
                    },
                  ]),
                ];
              case 2:
                yes = _b.sent().yes;
                if (yes) {
                  shipperServer_1 = new ShipperServer_1.default();
                  (_a = shipperServer_1.createProject(kebabCase(projectName))),
                    (name_1 = _a.name),
                    (token = _a.token),
                    (path = _a.path);
                  console.log('Project was created successfully!');
                  cmd_utils_1.displayKeyValue({
                    name: name_1,
                    path: path,
                    token: token,
                  });
                } else {
                  beginQuestion_1();
                }
                return [2 /*return*/];
            }
          });
        });
      };
      beginQuestion_1();
    }
  };
  CmdHandlers.list = function() {
    var shipperServer = new ShipperServer_1.default();
    var projects = shipperServer.getProjects();
    var lines = projects.map(function(_a) {
      var name = _a.name;
      return '- ' + name;
    });
    console.log(lines.join('\n'));
  };
  CmdHandlers.delete = function(argv) {
    return __awaiter(this, void 0, void 0, function() {
      var shipperServer, project, yes;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            shipperServer = new ShipperServer_1.default();
            project = shipperServer.getProject(argv.name);
            if (!project) return [3 /*break*/, 2];
            return [
              4 /*yield*/,
              inquirer_1.default.prompt([
                {
                  type: 'confirm',
                  name: 'yes',
                  message:
                    'This will delete the project and all its files: ' +
                    chalk_1.default.yellow(project.name),
                },
              ]),
            ];
          case 1:
            yes = _a.sent().yes;
            if (yes) {
              shipperServer.deleteProject(project.name);
              console.log(
                "Project '" +
                  chalk_1.default.yellow(argv.name) +
                  "' was deleted successfully",
              );
            }
            return [3 /*break*/, 3];
          case 2:
            console.log(
              "Project '" +
                chalk_1.default.yellow(argv.name) +
                "' does not exist",
            );
            _a.label = 3;
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  CmdHandlers.show = function(argv) {
    var shipperServer = new ShipperServer_1.default();
    var _a = shipperServer.getProject(argv.name) || {},
      name = _a.name,
      token = _a.token,
      path = _a.path;
    if (name && token && path) {
      cmd_utils_1.displayKeyValue({name: name, token: token, path: path});
    } else {
      console.log(
        "Project '" + chalk_1.default.yellow(argv.name) + "' does not exist",
      );
    }
  };
  CmdHandlers.start = function(argv) {
    var shipperServer = new ShipperServer_1.default();
    shipperServer.start(argv.port);
  };
  return CmdHandlers;
})();
exports.default = CmdHandlers;
