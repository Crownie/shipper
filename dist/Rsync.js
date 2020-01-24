'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var rsync_1 = __importDefault(require('rsync'));
var Rsync = /** @class */ (function() {
  function Rsync() {
    this.rsyncStatic = new rsync_1.default();
  }
  Rsync.prototype.shell = function(shell) {
    this.rsyncStatic.shell(shell);
    return this;
  };
  Rsync.prototype.flags = function(flags) {
    this.rsyncStatic.flags(flags);
    return this;
  };
  Rsync.prototype.source = function(s) {
    this.rsyncStatic.source(s);
    return this;
  };
  Rsync.prototype.destination = function(d) {
    this.rsyncStatic.destination(d);
    return this;
  };
  Rsync.prototype.set = function(opt, val) {
    this.rsyncStatic.set(opt, val);
    return this;
  };
  Rsync.prototype.execute = function() {
    var _this = this;
    console.log('\n' + this.rsyncStatic.command());
    return new Promise(function(resolve, reject) {
      _this.rsyncStatic.execute(function(error, code, cmd) {
        if (error) {
          reject(error);
        } else {
          resolve({code: code, cmd: cmd});
        }
      });
    });
  };
  return Rsync;
})();
exports.default = Rsync;
