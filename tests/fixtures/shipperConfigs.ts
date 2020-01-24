import Shipper, {ShipperConfig} from '../../src/Shipper';

export const dummyShipperConfig1: ShipperConfig = {
  ...Shipper.getDefaultConfig(),
  remoteRootFolder: '/home/crownie/apps/dummy',
  projectName: 'dummy-project',
  files: ['.dist', 'dummy2.js'],
  connection: {
    username: 'tester',
    host: 'localhost',
    privateKey: '/Users/tester/.ssh/id_rsa',
  },
  postDeployCmd: 'ls -al',
};
