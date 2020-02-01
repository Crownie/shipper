import * as fs from 'fs';
import {dummyShipperServerConfig} from './dummyShipperServerConfig';
import {SERVER_DIR_MOCK} from '../test-constants';

export default class ShipperServerFixture {
  public static getUploadFile() {
    const file = fs.createReadStream(__dirname + '/dummy.zip');
    const stat = fs.statSync(__dirname + '/dummy.zip');
    return {file, stat};
  }

  public static createTestConfig() {
    const configFile = SERVER_DIR_MOCK + '/shipper-server.json';
    try {
      fs.unlinkSync(configFile);
    } catch (e) {}
    fs.writeFileSync(
      configFile,
      JSON.stringify(dummyShipperServerConfig, null, 2),
    );
  }
}
