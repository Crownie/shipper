import {SERVER_DIR_MOCK} from '../test-constants';
import ShipperServer from '../../src/ShipperServer';

export default class ShipperFixture {
  static createDummyProject() {
    const shipperServer = new ShipperServer(SERVER_DIR_MOCK);
    const projectName = 'dummy-project';
    const projectsDir = SERVER_DIR_MOCK + '/projects';
    return shipperServer.createProject(projectName, projectsDir);
  }
}
