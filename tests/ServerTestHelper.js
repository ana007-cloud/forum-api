/* eslint-disable no-unused-vars */
const pool = require('../src/Infrastructures/database/postgres/pool');
const UsersTableTestHelper = require('./UsersTableTestHelper');

const ServerTestHelper = {
  async getAccessToken(
    server,
    {
      username = 'dicoding',
      password = 'secret',
      fullname = 'Dicoding Indonesia',
    } = {},
  ) {
    // Register user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: { username, password, fullname },
    });

    // Login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: { username, password },
    });

    const { data } = JSON.parse(loginResponse.payload);
    return data.accessToken;
  },

  async addThread(server, accessToken) {
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'thread title',
        body: 'thread body',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.addedThread.id;
  },

  async addComment(server, threadId, accessToken) {
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {
        content: 'comment content',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const responseJson = JSON.parse(response.payload);
    return responseJson.data.addedComment.id;
  },
};

module.exports = ServerTestHelper;
