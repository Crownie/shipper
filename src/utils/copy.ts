import fs from 'fs';
import path from 'path';

const glob = require('glob');

export const isGlob = (str): boolean => {
  return str.indexOf('*') >= 0;
};

export function copyFileSync(source, target) {
  let targetFile = target;

  //if target is a directory a new file with the same name will be created
  if (fs.existsSync(target)) {
    if (fs.lstatSync(target).isDirectory()) {
      targetFile = path.join(target, path.basename(source));
    }
  }

  fs.writeFileSync(targetFile, fs.readFileSync(source));
}

export async function copyFolderRecursive(source, target) {
  if (isGlob(source)) {
    const files = glob.sync(source, {});
    return Promise.all(files.map((src) => copyFolderRecursive(src, target)));
  }

  let files: string[] = [];

  //check if folder needs to be created or integrated
  const targetFolder = path.join(target, path.basename(source));
  if (fs.lstatSync(source).isDirectory() && !fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder);
  }

  //copy
  if (fs.lstatSync(source).isDirectory()) {
    files = fs.readdirSync(source);
    await Promise.all(
      files.map(async (file) => {
        const curSource = path.join(source, file);
        if (fs.lstatSync(curSource).isDirectory()) {
          return copyFolderRecursive(curSource, targetFolder);
        } else {
          copyFileSync(curSource, targetFolder);
        }
      }),
    );
  } else {
    copyFileSync(source, targetFolder);
  }
}
