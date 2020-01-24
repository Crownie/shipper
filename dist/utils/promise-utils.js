'use strict';
Object.defineProperty(exports, '__esModule', {value: true});
exports.rsyncExecutePromise = function(rsync) {
  return new Promise(function(resolve, reject) {
    rsync.execute(function(error, code, cmd) {
      if (error) {
        reject(error);
      } else {
        resolve({code: code, cmd: cmd});
      }
    });
  });
};
exports.delay = function(duration) {
  return new Promise(function(resolve) {
    setTimeout(resolve, duration);
  });
};
