import Shipper, {ShipperConfig} from '../../src/Shipper';

export const dummyShipperConfig1: ShipperConfig = {
  ...Shipper.getDefaultConfig(),
  remoteRootFolder: '/home/crownie/apps/dummy',
  projectName: 'dummy-project',
  files: ['.dist', 'dummy2.js'],
  connection: {
    username: 'crownie',
    host: '178.62.86.41',
    privateKey: '/Users/tobi/.ssh/id_rsa',
  },
};
