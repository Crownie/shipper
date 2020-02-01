import Shipper, {ShipperConfig} from '../../src/Shipper';

export const dummyShipperConfig1: ShipperConfig = {
  ...Shipper.getDefaultConfig(),
  host: 'http://localhost',
  projectName: 'dummy-project',
  files: ['.dist', 'dummy2.js'],
  postDeployCmd: 'ls -al',
};
