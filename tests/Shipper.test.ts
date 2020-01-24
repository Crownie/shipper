import Shipper from '../src/Shipper';
import fs from 'fs-extra';
import {dummyShipperConfig1} from './fixtures/shipperConfigs';
import {TestSsh} from './fixtures/TestSsh.fixture';

const dummyProjectPath = __dirname + '/dummy-project';
const shipperJson = dummyProjectPath + '/shipper.json';
const shipper = new Shipper(dummyProjectPath, new TestSsh());

const createShipperJsonFile = (data = dummyShipperConfig1) => {
  try {
    fs.unlinkSync(shipperJson);
  } catch (e) {}
  fs.writeFileSync(shipperJson, JSON.stringify(data, null, 2));
  shipper.loadConfig();
};

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
  });
});
