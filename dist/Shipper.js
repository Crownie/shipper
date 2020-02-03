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
var zip_utils_1 = require('./utils/zip-utils');
var axios_1 = __importDefault(require('axios'));
var form_data_1 = __importDefault(require('form-data'));
var ora_1 = __importDefault(require('ora'));
var Shipper = /** @class */ (function() {
  function Shipper(configPath) {
    if (configPath === void 0) {
      configPath = process.cwd();
    }
    this.configPath = configPath;
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
  Object.defineProperty(Shipper.prototype, 'tmpZipFile', {
    get: function() {
      return this.configPath + '/.tmp.zip';
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
            return [
              4 /*yield*/,
              zip_utils_1.zipDirectory(this.tmpFolder, this.tmpZipFile),
            ];
          case 2:
            _a.sent();
            return [4 /*yield*/, this.uploadTmp()];
          case 3:
            _a.sent();
            return [4 /*yield*/, this.removeZip()];
          case 4:
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
    if (!this.config.token) {
      throw new Error('config.token is required');
    }
    if (!this.config.projectName) {
      throw new Error('config.projectName is required');
    }
  };
  Shipper.prototype.uploadTmp = function() {
    return __awaiter(this, void 0, void 0, function() {
      var spinner, file, formData, url, data;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            spinner = ora_1.default('Uploading...').start();
            file = fs_extra_1.default.createReadStream(this.tmpZipFile);
            formData = new form_data_1.default();
            formData.append('file', file);
            formData.append('preDeployCmd', this.config.preDeployCmd || '');
            formData.append('postDeployCmd', this.config.postDeployCmd || '');
            url = this.config.host + '/upload/' + this.config.projectName;
            return [
              4 /*yield*/,
              axios_1.default.post(url, formData, {
                headers: __assign(
                  {Authorization: this.config.token},
                  formData.getHeaders(),
                ),
                onUploadProgress: function(progressEvent) {
                  var percentCompleted = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total,
                  );
                  console.log(percentCompleted);
                },
              }),
            ];
          case 1:
            data = _a.sent().data;
            spinner.stop();
            return [4 /*yield*/, Shipper.removeFolder(this.tmpFolder)];
          case 2:
            _a.sent();
            console.log(data.stdout);
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
            if (this.config.files.length === 0) {
              throw new Error(
                'no files or folders specified. See shipper.json',
              );
            }
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
  Shipper.prototype.removeZip = function() {
    return __awaiter(this, void 0, void 0, function() {
      var err_2;
      return __generator(this, function(_a) {
        switch (_a.label) {
          case 0:
            _a.trys.push([0, 2, , 3]);
            return [
              4 /*yield*/,
              fs_extra_1.default.unlinkSync(this.tmpZipFile),
            ];
          case 1:
            _a.sent();
            return [3 /*break*/, 3];
          case 2:
            err_2 = _a.sent();
            console.error(err_2);
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
      token: '',
      host: '',
      files: [],
      preDeployCmd: '',
      postDeployCmd: '',
    };
  };
  return Shipper;
})();
exports.default = Shipper;
