import fs from 'fs';
import archiver from 'archiver';
import unzipper from 'unzipper';

/**
 * @param {String} source folder path
 * @param {String} destination file path
 * @returns {Promise}
 */
export function zipDirectory(source, destination) {
  const archive = archiver('zip', {zlib: {level: 9}});
  const stream = fs.createWriteStream(destination);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', (err) => reject(err))
      .pipe(stream);

    stream.on('close', () => resolve());
    archive.finalize().then();
  });
}

export async function unzipFile(filePath, destination): Promise<void> {
  return fs
    .createReadStream(filePath)
    .pipe(unzipper.Extract({path: destination, concurrency: 1}))
    .promise();
}
