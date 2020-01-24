import Shipper from '../src/Shipper';
import fs from 'fs-extra';
import {dummyShipperConfig1} from './fixtures/shipperConfigs';
import {MockSsh} from './mocks/MockSsh';
import MockRsyncHelper from './mocks/MockRsyncHelper';

const dummyProjectPath = __dirname + '/dummy-project';
const shipperJson = dummyProjectPath + '/shipper.json';
const shipper = new Shipper(
  dummyProjectPath,
  new MockSsh(),
  new MockRsyncHelper(),
);

const createShipperJsonFile = (data = dummyShipperConfig1) => {
  try {
    fs.unlinkSync(shipperJson);
  } catch (e) {}
  fs.writeFileSync(shipperJson, JSON.stringify(data, null, 2));
  shipper.loadConfig();
};

const clearSshFolder = () => {
  try {
    fs.removeSync(__dirname + '/__ssh__');
  } catch (e) {}
  try {
    fs.mkdirSync(__dirname + '/__ssh__');
  } catch (e) {}
};

beforeEach(() => {
  clearSshFolder();
});

describe('init', () => {
  it('initialise fresh project', () => {
    try {
      fs.unlinkSync(shipperJson);
    } catch (e) {}
    shipper.init();
    expect(fs.existsSync(shipperJson)).toBeTruthy();
    const data = JSON.parse(fs.readFileSync(shipperJson).toString());
    expect(data).toMatchSnapshot();
  });
});

describe('deploy', () => {
  it('deploy', async () => {
    createShipperJsonFile();
    await shipper.deploy();
    expect(
      fs.existsSync(__dirname + '/__ssh__/dummy-project/dummy2.js'),
    ).toBeTruthy();
    expect(
      fs.existsSync(__dirname + '/__ssh__/dummy-project/.dist/dummy.js'),
    ).toBeTruthy();
  });
});
