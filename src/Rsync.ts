import RsyncStatic from 'rsync';

export default class Rsync {
  private rsyncStatic: any;

  private constructor() {
    this.rsyncStatic = new RsyncStatic();
  }

  shell(shell: string) {
    this.rsyncStatic.shell('ssh');
    return this;
  }

  flags(shell: string) {
    this.rsyncStatic.flags('ssh');
    return this;
  }

  source(s: string) {
    this.rsyncStatic.source(s);
    return this;
  }

  destination(d: string) {
    this.rsyncStatic.destination(d);
    return this;
  }

  set(opt: string, val: string) {
    this.rsyncStatic.set(opt, val);
    return this;
  }

  execute() {
    return new Promise((resolve, reject) => {
      this.rsyncStatic.execute(function(error, code, cmd) {
        if (error) {
          reject(error);
        } else {
          resolve({code, cmd});
        }
      });
    });
  }

  static new(): Rsync {
    return new Rsync();
  }
}
