'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var Rsync_1 = __importDefault(require('./Rsync'));
var RsyncHelper = /** @class */ (function() {
  function RsyncHelper() {}
  RsyncHelper.prototype.start = function() {
    return new Rsync_1.default();
  };
  return RsyncHelper;
})();
exports.default = RsyncHelper;
