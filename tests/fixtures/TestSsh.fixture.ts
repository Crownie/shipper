import Ssh, {
  ConnectionParams,
  ExecCommandOpts,
  ExecCommandResponse,
} from '../../src/Ssh';
import {exec} from 'child_process';

export class TestSsh extends Ssh {
  async connect(connectionParams: ConnectionParams): Promise<this> {
    const credentials = {
      host: 'localhost',
      username: 'tester',
      privateKey: '/Users/tester/.ssh/id_rsa',
    };
    for (const field of Object.keys(credentials)) {
      if (credentials[field] !== connectionParams[field]) {
        throw new Error(
          `invalid credentials. Expected:\n${JSON.stringify(
            credentials,
            null,
            2,
          )}`,
        );
      }
    }
    return this;
  }

  async execCommand(
    command: string,
    opts?: ExecCommandOpts,
  ): Promise<ExecCommandResponse> {
    const pat = new RegExp(`${opts?.cwd}`, 'g');
    const newCwd = __dirname + '/../__ssh__';
    command = command.replace(pat, newCwd);
    return await this.execLocal(command);
  }

  private execLocal(command): Promise<ExecCommandResponse> {
    return new Promise((resolve, reject) => {
      exec(command, (err, stdout, stderr) => {
        resolve({
          code: 0,
          options: '',
          signal: '',
          stderr,
          stdout,
        });
      });
    });
  }
}
