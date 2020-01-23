'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function(mod) {
    return mod && mod.__esModule ? mod : {default: mod};
  };
Object.defineProperty(exports, '__esModule', {value: true});
var fs_1 = __importDefault(require('fs'));
var path_1 = __importDefault(require('path'));
var glob = require('glob');
exports.isGlob = function(str) {
  console.log('isglob', str, str.indexOf('*'));
  return str.indexOf('*') >= 0;
};
function copyFileSync(source, target) {
  var targetFile = target;
  //if target is a directory a new file with the same name will be created
  if (fs_1.default.existsSync(target)) {
    if (fs_1.default.lstatSync(target).isDirectory()) {
      targetFile = path_1.default.join(target, path_1.default.basename(source));
    }
  }
  fs_1.default.writeFileSync(targetFile, fs_1.default.readFileSync(source));
}
exports.copyFileSync = copyFileSync;
function copyFolderRecursiveSync(source, target) {
  if (exports.isGlob(source)) {
    glob(source, {}, function(err, files) {
      console.log('glob', files);
      files.forEach(function(src) {
        return copyFolderRecursiveSync(src, target);
      });
    });
    return;
  }
  var files = [];
  //check if folder needs to be created or integrated
  var targetFolder = path_1.default.join(
    target,
    path_1.default.basename(source),
  );
  console.log(targetFolder);
  if (
    fs_1.default.lstatSync(source).isDirectory() &&
    !fs_1.default.existsSync(targetFolder)
  ) {
    fs_1.default.mkdirSync(targetFolder);
  }
  //copy
  if (fs_1.default.lstatSync(source).isDirectory()) {
    files = fs_1.default.readdirSync(source);
    files.forEach(function(file) {
      var curSource = path_1.default.join(source, file);
      if (fs_1.default.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else {
        copyFileSync(curSource, targetFolder);
      }
    });
  } else {
    copyFileSync(source, targetFolder);
  }
}
exports.copyFolderRecursiveSync = copyFolderRecursiveSync;
