import NodeSsh from 'node-ssh';

export default class Ssh {
  private nodeSsh: any;

  constructor() {
    this.nodeSsh = new NodeSsh();
  }

  async connect(connectionParams: ConnectionParams): Promise<this> {
    await this.nodeSsh.connect(connectionParams);
    return this;
  }

  async execCommand(
    command: string,
    opts?: ExecCommandOpts,
  ): Promise<ExecCommandResponse> {
    return await this.nodeSsh.execCommand(command, opts);
  }

  dispose(): void {
    this.nodeSsh.dispose();
  }
}

export interface ConnectionParams {
  host: string;
  username: string;
  privateKey?: string;
  port?: number;
  password?: string;
  passphrase?: string; // the passphrase used for decrypting the private key
}

export interface ExecCommandResponse {
  stdout: string;
  options?: Object;
  stderr: string;
  signal?: string;
  code: number;
}

export interface ExecCommandOpts {
  cwd: string;
  stdin?: string;
}
