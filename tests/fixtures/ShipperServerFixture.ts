import * as fs from 'fs';
import {dummyShipperServerConfig} from './dummyShipperServerConfig';
import {SERVER_DIR_MOCK} from '../test-constants';

const configFile = SERVER_DIR_MOCK + '/shipper-server.json';
export default class ShipperServerFixture {
  public static getUploadFile() {
    const file = fs.createReadStream(__dirname + '/dummy.zip');
    const stat = fs.statSync(__dirname + '/dummy.zip');
    return {file, stat};
  }

  public static createTestConfig() {
    ShipperServerFixture.removeConfig();
    fs.writeFileSync(
      configFile,
      JSON.stringify(dummyShipperServerConfig, null, 2),
    );
  }

  static removeConfig() {
    try {
      fs.unlinkSync(configFile);
    } catch (e) {}
  }
}
