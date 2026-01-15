const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should respond 201 and persist thread', async () => {
    // Arrange
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Sebuah thread',
        body: 'Isi thread-nya',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.data.addedThread).toBeDefined();
  });

  it('should respond 200 and return thread detail', async () => {
    // Arrange
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);

    const addThreadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Thread title',
        body: 'Thread body',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const {
      data: { addedThread },
    } = JSON.parse(addThreadResponse.payload);

    // Action
    const getThreadResponse = await server.inject({
      method: 'GET',
      url: `/threads/${addedThread.id}`,
    });

    // Assert
    const responseJson = JSON.parse(getThreadResponse.payload);
    expect(getThreadResponse.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.data.thread).toBeDefined();
    expect(responseJson.data.thread.id).toEqual(addedThread.id);
  });
});
