import RsyncStatic from 'rsync';

export default class Rsync {
  protected rsyncStatic: any;

  public constructor() {
    this.rsyncStatic = new RsyncStatic();
  }

  shell(shell: string) {
    this.rsyncStatic.shell(shell);
    return this;
  }

  flags(flags: string) {
    this.rsyncStatic.flags(flags);
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
    console.log('\n' + this.rsyncStatic.command());
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
}
