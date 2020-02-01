import request from 'supertest';
import ShipperServer from '../src/ShipperServer';
import ShipperServerFixture from './fixtures/ShipperServerFixture';
import {SERVER_DIR_MOCK} from './test-constants';

const shipperServer = new ShipperServer(SERVER_DIR_MOCK);

describe('ping', () => {
  it('pings server', async () => {
    const {status, body} = await request(shipperServer.getServer())
      .get('/ping')
      .send();
    expect(status).toEqual(200);
    expect(body).toEqual({message: 'Hello World!'});
  });
});

describe('upload', () => {
  it('upload', async () => {
    ShipperServerFixture.createTestConfig();
    const {file, stat} = ShipperServerFixture.getUploadFile();
    const {status, body} = await request(shipperServer.getServer())
      .post('/upload/dummy-project')
      .set('Authorization', 'dummy-token')
      .attach('file', file);
    expect(status).toEqual(200);
    expect(body).toEqual({message: 'Hello World!'});
  });
});

describe('createProject', () => {
  it('create project', async () => {
    const projectName = 'dummy-project';
    const projectsDir = SERVER_DIR_MOCK + '/projects';
    const {path, token} = shipperServer.createProject(projectName, projectsDir);
    expect(path).toEqual(projectsDir + '/' + projectName);
    expect(token).toBeDefined();
  });
});
