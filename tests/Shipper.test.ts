import Shipper from '../src/Shipper';
import fs from 'fs-extra';
import {dummyShipperConfig1} from './fixtures/shipperConfigs';
import ShipperFixture from './fixtures/ShipperFixture';
import nock from 'nock';

const dummyProjectPath = __dirname + '/dummy-project';
const shipperJson = dummyProjectPath + '/shipper.json';
const shipper = new Shipper(dummyProjectPath);

const createShipperJsonFile = (data = dummyShipperConfig1) => {
  try {
    fs.unlinkSync(shipperJson);
  } catch (e) {}
  fs.writeFileSync(shipperJson, JSON.stringify(data, null, 2));
  shipper.loadConfig();
};

const clearServerFolder = () => {
  try {
    fs.removeSync(__dirname + '/__server-dir-mock__');
  } catch (e) {}
  try {
    fs.mkdirSync(__dirname + '/__server-dir-mock__');
  } catch (e) {}
};

beforeEach(() => {
  clearServerFolder();
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
  beforeAll(() => {
    const scope = nock('http://localhost')
      .post('/upload/dummy-project')
      .reply(200, {});
  });

  it('deploy', async () => {
    const {token} = ShipperFixture.createDummyProject();
    createShipperJsonFile({...dummyShipperConfig1, token});
    await shipper.deploy();
  });
});
