export const rsyncExecutePromise = (rsync) => {
  return new Promise((resolve, reject) => {
    rsync.execute(function(error, code, cmd) {
      if (error) {
        reject(error);
      } else {
        resolve({code, cmd});
      }
    });
  });
};

export const delay = (duration): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
};
