const pool = require('../../database/postgres/pool');
const createServer = require('../createServer');
const container = require('../../container');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const ServerTestHelper = require('../../../../tests/ServerTestHelper');
const CommentHandler = require('../../../Interfaces/http/api/comments/handler');

describe('/threads/{threadId}/comments endpoint', () => {
  it('should respond 201 and persist comment', async () => {
    // Arrange
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);

    // Create thread
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: {
        title: 'Thread untuk komentar',
        body: 'Isi thread untuk komentar',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const { id: threadId } = JSON.parse(threadResponse.payload).data
      .addedThread;

    // Action
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {
        content: 'Komentar pertama',
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJson.status).toEqual('success');
    expect(responseJson.data.addedComment).toBeDefined();
    expect(responseJson.data.addedComment.content).toEqual('Komentar pertama');
  });

  it('should respond 400 when request payload not contain needed property', async () => {
    // Arrange
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'Judul', body: 'Isi' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { id: threadId } = JSON.parse(threadResponse.payload).data
      .addedThread;

    // Action
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: {}, // missing content
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('harus mengirimkan properti content');
  });

  it('should respond 401 when request without authentication', async () => {
    // Arrange
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);
    const threadResponse = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: { title: 'Judul', body: 'Isi' },
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const { id: threadId } = JSON.parse(threadResponse.payload).data
      .addedThread;

    // Action — without token
    const response = await server.inject({
      method: 'POST',
      url: `/threads/${threadId}/comments`,
      payload: { content: 'Komentar tanpa token' },
    });

    // Assert
    expect(response.statusCode).toEqual(401);
  });

  it('should rethrow unexpected error from use case', async () => {
    // Arrange
    const mockAddCommentUseCase = {
      execute: jest.fn().mockRejectedValue(new Error('unexpected failure')),
    };

    const mockContainer = {
      getInstance: jest.fn(() => mockAddCommentUseCase),
    };

    const handler = new CommentHandler(mockContainer);

    const mockRequest = {
      auth: { credentials: { id: 'user-123' } },
      params: { threadId: 'thread-123' },
      payload: { content: 'komentar' },
    };

    const mockH = {
      response: jest.fn().mockReturnThis(),
      code: jest.fn().mockReturnThis(),
    };

    // Action & Assert
    await expect(
      handler.postCommentHandler(mockRequest, mockH),
    ).rejects.toThrow('unexpected failure');
  });
});

describe('/threads/{threadId}/comments/{commentId} endpoint', () => {
  it('should respond 200 when comment deleted successfully', async () => {
    // Arrange
    const server = await createServer(container);
    const accessToken = await ServerTestHelper.getAccessToken(server);
    const threadId = await ServerTestHelper.addThread(server, accessToken);
    const commentId = await ServerTestHelper.addComment(
      server,
      threadId,
      accessToken,
    );

    // Action
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(200);
    expect(responseJson.status).toEqual('success');
  });

  it('should respond 403 when user tries to delete comment owned by another user', async () => {
    // Arrange
    const server = await createServer(container);

    // User A
    const accessTokenA = await ServerTestHelper.getAccessToken(server);
    const threadId = await ServerTestHelper.addThread(server, accessTokenA);
    const commentId = await ServerTestHelper.addComment(
      server,
      threadId,
      accessTokenA,
    );

    // User B
    const accessTokenB = await ServerTestHelper.getAccessToken(server, {
      username: 'userB',
      password: 'secret',
      fullname: 'User B',
    });

    // Action — user B deletes user A’s comment
    const response = await server.inject({
      method: 'DELETE',
      url: `/threads/${threadId}/comments/${commentId}`,
      headers: { Authorization: `Bearer ${accessTokenB}` },
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(403);
    expect(responseJson.status).toEqual('fail');
  });
});

afterEach(async () => {
  await CommentsTableTestHelper.cleanTable();
  await ThreadsTableTestHelper.cleanTable();
  await UsersTableTestHelper.cleanTable();
});

it('should respond 404 when thread does not exist', async () => {
  // Arrange
  const server = await createServer(container);
  const accessToken = await ServerTestHelper.getAccessToken(server);

  // Non-existent thread and comment
  const fakeThreadId = 'thread-xyz';
  const fakeCommentId = 'comment-xyz';

  // Action
  const response = await server.inject({
    method: 'DELETE',
    url: `/threads/${fakeThreadId}/comments/${fakeCommentId}`,
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  // Assert
  const responseJson = JSON.parse(response.payload);
  expect(response.statusCode).toEqual(404);
  expect(responseJson.status).toEqual('fail');
});

afterAll(async () => {
  await pool.end();
});
