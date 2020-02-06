import request from 'supertest';
import ShipperServer from '../src/ShipperServer';
import ShipperServerFixture from './fixtures/ShipperServerFixture';
import {SERVER_DIR_MOCK} from './test-constants';

const shipperServer = new ShipperServer(SERVER_DIR_MOCK);

describe('ping', () => {
  it('pings server', async () => {
    const {status, body} = await request(shipperServer.getExpressApp())
      .get('/ping')
      .send();
    expect(status).toEqual(200);
    expect(body).toEqual({message: 'Hello World!'});
  });
});

describe('upload', () => {
  it('upload', async () => {
    ShipperServerFixture.createTestConfig();
    shipperServer.loadConfig();
    const {file, stat} = ShipperServerFixture.getUploadFile();
    const {status, body} = await request(shipperServer.getExpressApp())
      .post('/upload/dummy-project')
      .set('Authorization', 'dummy-token')
      .field('postDeployCmd', 'ls')
      .attach('file', file);
    expect(status).toEqual(200);
    expect(body.message).toEqual('Done!');
    console.log(body.stdout);
  });
});

describe('createProject', () => {
  beforeEach(() => {
    ShipperServerFixture.removeConfig();
    shipperServer.loadConfig();
  });
  it('create project', async () => {
    const projectName = 'dummy-project';
    const projectsDir = SERVER_DIR_MOCK + '/projects';
    const {path, token} = shipperServer.createProject(projectName, projectsDir);
    expect(path).toEqual(projectsDir + '/' + projectName);
    expect(token).toBeDefined();
  });
});
