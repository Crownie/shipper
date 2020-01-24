import Rsync from './Rsync';

export default class RsyncHelper {
  start(): Rsync {
    return new Rsync();
  }
}
