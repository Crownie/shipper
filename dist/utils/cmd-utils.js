'use strict';
var __importStar =
  (this && this.__importStar) ||
  function(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result['default'] = mod;
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var boxen_1 = __importStar(require('boxen'));
var chalk_1 = __importDefault(require('chalk'));
var child_process_1 = require('child_process');
exports.displayKeyValue = function(obj) {
  var boxenOptions = {
    padding: 1,
    margin: 1,
    borderStyle: 'round' /* Round */,
    borderColor: 'green',
    backgroundColor: '#555555',
  };
  var lines = [];
  for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
    var key = _a[_i];
    var colKey = chalk_1.default.yellow(key);
    var val = obj[key];
    lines.push(colKey + ': ' + val);
  }
  var msgBox = boxen_1.default(lines.join('\n'), boxenOptions);
  console.log(msgBox);
};
exports.execCmd = function(cmd) {
  return new Promise(function(resolve, reject) {
    child_process_1.exec(cmd, function(error, stdout, stderr) {
      if (error) {
        return reject(error.message);
      }
      if (stderr) {
        return reject(stderr);
      }
      resolve(stdout);
    });
  });
};
