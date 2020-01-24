import RsyncHelper from '../../src/RsyncHelper';
import MockRsync from './MockRsync';

export default class MockRsyncHelper extends RsyncHelper {
  start(): MockRsync {
    return new MockRsync();
  }
}
