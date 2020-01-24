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
var fs_extra_1 = __importDefault(require('fs-extra'));
var copy_1 = require('./utils/copy');
var promise_utils_1 = require('./utils/promise-utils');
var ora_1 = __importDefault(require('ora'));
var Ssh_1 = __importDefault(require('./Ssh'));
var RsyncHelper_1 = __importDefault(require('./RsyncHelper'));
var Shipper = /** @class */ (function() {
  function Shipper(configPath, ssh, rsyncHelper) {
    if (configPath === void 0) {
      configPath = process.cwd();
    }
    if (ssh === void 0) {
      ssh = new Ssh_1.default();
    }
    if (rsyncHelper === void 0) {
      rsyncHelper = new RsyncHelper_1.default();
    }
    this.configPath = configPath;
    this.ssh = ssh;
    this.rsyncHelper = rsyncHelper;
    this.config = Shipper.getDefaultConfig();
    this.configFile = configPath + '/shipper.json';
    this.loadConfig();
  }
  Object.defineProperty(Shipper.prototype, 'tmpFolder', {
    get: function() {
      return this.configPath + '/.tmp';
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(Shipper.prototype, 'remoteFolder', {
    get: function() {
      return this.config.remoteRootFolder + '/' + this.config.projectName;
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(Shipper.prototype, 'remoteTmpFolder', {
    get: function() {
      return this.remoteFolder + '_tmp';
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(Shipper.prototype, 'remoteOldFolder', {
    get: function() {
      return this.remoteFolder + '_old';
    },
    enumerable: true,
    configurable: true,
  });
  Object.defineProperty(Shipper.prototype, 'sshDestination', {
    get: function() {
      var _a = this.config.connection,
        username = _a.username,
        host = _a.host;
      return username + '@' + host + ':' + this.remoteTmpFolder;
    },
    enumerable: true,
    configurable: true,
  });
  Shipper.prototype.init = function() {
    var data = JSON.stringify(Shipper.getDefaultConfig(), null, 2);
    try {
      fs_extra_1.default.writeFileSync(this.configFile, data, {flag: 'wx'});
      console.log('created file shipper.json');
    } catch (e) {
      console.log('shipper.json already exists');
    }
  };
  Shipper.prototype.deploy = function() {
    return __awaiter(this, void 0, void 0, function() {
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            this.validateConfig();
            return [4 /*yield*/, this.copyToTmp()];
          case 1:
            _a.sent();
            return [4 /*yield*/, this.uploadTmp()];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  };
  Shipper.prototype.validateConfig = function() {
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
  };
  Shipper.prototype.uploadTmp = function() {
    return __awaiter(this, void 0, void 0, function() {
      var spinner,
        removeOldCmd,
        backupCmd,
        installCmd,
        cdInstallationDir,
        _a,
        stdout,
        stderr;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            spinner = ora_1.default('Connecting to server via ssh').start();
            // connect to ssh
            return [4 /*yield*/, this.ssh.connect(this.config.connection)];
          case 1:
            // connect to ssh
            _b.sent();
            return [
              4 /*yield*/,
              this.ssh.execCommand(
                'rm -rf ' +
                  this.remoteTmpFolder +
                  ' && mkdir -p ' +
                  this.remoteTmpFolder,
                {cwd: this.config.remoteRootFolder},
              ),
            ];
          case 2:
            _b.sent();
            // upload contents of .tmp
            spinner.text = 'Uploading files and folders';
            return [
              4 /*yield*/,
              this.rsyncHelper
                .start()
                .shell('ssh')
                .flags('avz')
                .source(this.tmpFolder + '/')
                .destination(this.sshDestination + '/')
                .set('e', 'ssh -i ' + this.config.connection.privateKey)
                .execute(),
            ];
          case 3:
            _b.sent();
            removeOldCmd = 'rm -rf ' + this.remoteOldFolder;
            backupCmd = 'mv ' + this.remoteFolder + ' ' + this.remoteOldFolder;
            installCmd = 'mv ' + this.remoteTmpFolder + ' ' + this.remoteFolder;
            cdInstallationDir = 'cd ' + this.remoteFolder;
            // remove previous backup
            console.log('\n', removeOldCmd);
            return [
              4 /*yield*/,
              this.ssh.execCommand(removeOldCmd, {
                cwd: this.config.remoteRootFolder,
              }),
            ];
          case 4:
            _b.sent();
            // create new backup
            console.log('\n', backupCmd);
            return [
              4 /*yield*/,
              this.ssh.execCommand(backupCmd, {
                cwd: this.config.remoteRootFolder,
              }),
            ];
          case 5:
            _b.sent();
            // install new
            console.log('\n', installCmd);
            return [
              4 /*yield*/,
              this.ssh.execCommand(installCmd, {
                cwd: this.config.remoteRootFolder,
              }),
            ];
          case 6:
            _b.sent();
            if (!this.config.postDeployCmd) return [3 /*break*/, 9];
            spinner.text = 'Running post deploy commands:';
            return [4 /*yield*/, promise_utils_1.delay(1000)];
          case 7:
            _b.sent();
            spinner.stop();
            console.log('\n', this.config.postDeployCmd);
            return [
              4 /*yield*/,
              this.ssh.execCommand(
                cdInstallationDir + ' && ' + this.config.postDeployCmd,
                {
                  cwd: this.config.remoteRootFolder,
                },
              ),
            ];
          case 8:
            (_a = _b.sent()), (stdout = _a.stdout), (stderr = _a.stderr);
            console.log('\x1b[34m%s\x1b[0m', stdout);
            console.log('\x1b[31m%s\x1b[0m', stderr);
            _b.label = 9;
          case 9:
            return [4 /*yield*/, Shipper.removeFolder(this.tmpFolder)];
          case 10:
            _b.sent();
            // close connection
            this.ssh.dispose();
            console.log('\n ✅  Deployed Successfully! 🎉');
            return [2 /*return*/];
        }
      });
    });
  };
  /**
   * copy specified files in @code{this.config} to .tmp folder
   */
  Shipper.prototype.copyToTmp = function() {
    return __awaiter(this, void 0, void 0, function() {
      var _i, _a, path, e_1;
      return __generator(this, function(_b) {
        switch (_b.label) {
          case 0:
            if (!this.config) return [3 /*break*/, 7];
            return [4 /*yield*/, Shipper.removeFolder(this.tmpFolder)];
          case 1:
            _b.sent();
            fs_extra_1.default.mkdirSync(this.tmpFolder);
            (_i = 0), (_a = this.config.files);
            _b.label = 2;
          case 2:
            if (!(_i < _a.length)) return [3 /*break*/, 7];
            path = _a[_i];
            _b.label = 3;
          case 3:
            _b.trys.push([3, 5, , 6]);
            return [
              4 /*yield*/,
              copy_1.copyFolderRecursive(
                this.configPath + '/' + path,
                this.tmpFolder,
              ),
            ];
          case 4:
            _b.sent();
            return [3 /*break*/, 6];
          case 5:
            e_1 = _b.sent();
            throw e_1;
          case 6:
            _i++;
            return [3 /*break*/, 2];
          case 7:
            return [2 /*return*/];
        }
      });
    });
  };
  Shipper.removeFolder = function(folder) {
    return __awaiter(this, void 0, void 0, function() {
      var err_1;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [4 /*yield*/, fs_extra_1.default.remove(folder)];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            err_1 = _a.sent();
            console.error(err_1);
            return [3 /*break*/, 3];
          case 3:
            return [2 /*return*/];
        }
      });
    });
  };
  Shipper.prototype.loadConfig = function() {
    try {
      var data = fs_extra_1.default.readFileSync(this.configFile);
      var newConfig = JSON.parse(data.toString());
      this.config = __assign(__assign({}, newConfig), {
        connection: __assign({}, newConfig.connection),
      });
    } catch (e) {}
  };
  Shipper.getDefaultConfig = function() {
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
  };
  return Shipper;
})();
exports.default = Shipper;
