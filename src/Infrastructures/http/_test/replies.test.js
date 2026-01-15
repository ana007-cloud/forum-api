const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');

const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');

describe('/replies endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  it('should respond 200 when delete reply', async () => {
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);

    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        title: 'judul thread',
        body: 'isi thread',
      },
    });

    const threadId = JSON.parse(threadResponse.payload).data.addedThread.id;

    const commentResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'isi comment',
      },
    });

    const commentId = JSON.parse(commentResponse.payload).data.addedComment.id;

    const replyResponse = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments/${commentId}/replies`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      payload: {
        content: 'isi reply',
      },
    });

    const replyId = JSON.parse(replyResponse.payload).data.addedReply.id;

    // Action
    const deleteResponse = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}/replies/${replyId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    expect(deleteResponse.statusCode).toBe(200);
  });
});
