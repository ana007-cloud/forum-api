const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('ReplyRepositoryPostgres', () => {
  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addReply function', () => {
    it('should persist reply and return added reply correctly', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const repo = new ReplyRepositoryPostgres(pool, () => '123');
      const addReply = new AddReply({
        content: 'sebuah balasan',
        owner: 'user-123',
        commentId: 'comment-123',
      });

      // Action
      const addedReply = await repo.addReply(addReply);

      // Assert
      expect(addedReply).toStrictEqual(
        new AddedReply({
          id: 'reply-123',
          content: 'sebuah balasan',
          owner: 'user-123',
        }),
      );
    });

    it('should return empty array when commentIds is empty', async () => {
      // Arrange
      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      // Action
      const replies = await repo.getRepliesByCommentIds([]);

      // Assert
      expect(replies).toEqual([]);
    });

    it('should get replies correctly (raw data)', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'ana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'balasan aktif',
        isDelete: false,
      });

      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      // Action
      const replies = await repo.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies).toEqual([
        {
          id: 'reply-123',
          content: 'balasan aktif',
          date: expect.any(String),
          username: 'ana',
          commentId: 'comment-123',
          is_delete: false,
        },
      ]);
    });

    it('should mark reply as deleted', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123', username: 'ana' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
        content: 'balasan rahasia',
        isDelete: false,
      });

      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      // Action
      await repo.deleteReplyById('reply-123');
      const replies = await repo.getRepliesByCommentIds(['comment-123']);

      // Assert
      expect(replies[0].is_delete).toBe(true);
      expect(replies[0].content).toBe('balasan rahasia');
    });

    it('should throw error when reply not found', async () => {
      // Arrange
      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(
        repo.verifyReplyOwner('reply-not-found', 'user-123'),
      ).rejects.toThrow('REPLY.NOT_FOUND');
    });

    it('should throw error when reply not owned', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({ id: 'thread-123' });
      await CommentsTableTestHelper.addComment({
        id: 'comment-123',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      await RepliesTableTestHelper.addReply({
        id: 'reply-123',
        commentId: 'comment-123',
        owner: 'user-123',
      });

      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(
        repo.verifyReplyOwner('reply-123', 'user-lain'),
      ).rejects.toThrow('REPLY.NOT_OWNED');
    });

    it('should throw error when deleting non-existing reply', async () => {
      // Arrange
      const repo = new ReplyRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(repo.deleteReplyById('reply-tidak-ada')).rejects.toThrow(
        'REPLY.NOT_FOUND',
      );
    });
  });
});
