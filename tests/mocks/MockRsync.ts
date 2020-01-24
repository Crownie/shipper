import Rsync from '../../src/Rsync';
import {dummyShipperConfig1} from '../fixtures/shipperConfigs';

export default class MockRsync extends Rsync {
  private static replacePath(s: string): string {
    s = s.replace('tester@localhost:', '');
    const pat2 = new RegExp(dummyShipperConfig1.remoteRootFolder, 'g');
    const newCwd = __dirname + '/../__ssh__';
    s = s.replace(pat2, newCwd);
    return s;
  }

  source(s: string): this {
    return super.source(MockRsync.replacePath(s));
  }

  destination(d: string): this {
    return super.destination(MockRsync.replacePath(d));
  }

  set(opt: string, val: string): this {
    return this;
  }

  execute(): Promise<unknown> {
    return super.execute();
  }
}
