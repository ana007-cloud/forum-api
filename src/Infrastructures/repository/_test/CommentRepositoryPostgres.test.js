const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');

describe('CommentRepositoryPostgres', () => {
  beforeAll(async () => {
    await UsersTableTestHelper.addUser({
      id: 'user-123',
      username: 'dicoding',
    });
    await UsersTableTestHelper.addUser({ id: 'user-999', username: 'Ana' }); // tambahan agar FK tidak error
    await ThreadsTableTestHelper.addThread({
      id: 'thread-123',
      owner: 'user-123',
    });
  });

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await pool.end();
  });

  it('should be instance of CommentRepository', () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});
    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  describe('addComment function', () => {
    it('should persist added comment and return added comment correctly', async () => {
      // Arrange
      const addComment = new AddComment({ content: 'sebuah komentar' });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Action
      const addedComment = await commentRepositoryPostgres.addComment(
        addComment,
        'thread-123',
        'user-123',
      );

      // Assert
      const comments = await CommentsTableTestHelper.findCommentById(
        'comment-123',
      );
      expect(comments).toHaveLength(1);
      expect(comments[0].content).toBe('sebuah komentar');
      expect(comments[0].owner).toBe('user-123');

      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'sebuah komentar',
          owner: 'user-123',
        }),
      );
    });
  });

  describe('verifyCommentAvailability function', () => {
    it('should throw NotFoundError when comment does not exist', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => '123',
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('not-exist'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should not throw error when comment exists', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-999',
        content: 'testing',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => '123',
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentAvailability('comment-999'),
      ).resolves.not.toThrow();
    });
  });

  describe('verifyCommentOwner function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      // Arrange
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => '123',
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('not-exist', 'user-123'),
      ).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when owner does not match', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-777',
        content: 'bukan punyamu',
        owner: 'user-999',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => '123',
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-777', 'user-123'),
      ).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw error when owner matches', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-555',
        content: 'punyaku sendiri',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => '123',
      );

      // Action & Assert
      await expect(
        commentRepositoryPostgres.verifyCommentOwner('comment-555', 'user-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('deleteCommentById function', () => {
    it('should mark comment as deleted', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-321',
        content: 'hapus aku',
        owner: 'user-123',
        threadId: 'thread-123',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => 'xyz',
      );

      // Action & Assert
      await commentRepositoryPostgres.deleteCommentById('comment-321');
      const result = await CommentsTableTestHelper.findCommentById(
        'comment-321',
      );
      expect(result[0].is_delete).toBe(true);
    });
  });

  describe('getCommentsByThreadId function', () => {
    it('should return all comments in a thread ordered by date ASC', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: 'user-456',
        username: 'johndoe',
      });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-456',
        owner: 'user-123',
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-1',
        content: 'komentar pertama',
        owner: 'user-456',
        threadId: 'thread-456',
        date: '2021-08-08T07:19:09.775Z',
        is_delete: false,
      });

      await CommentsTableTestHelper.addComment({
        id: 'comment-2',
        content: 'komentar kedua',
        owner: 'user-123',
        threadId: 'thread-456',
        date: '2021-08-08T08:00:00.000Z',
        is_delete: true,
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      // Action
      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-456',
      );

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('comment-1');
      expect(result[0].username).toBe('johndoe');
      expect(result[0].date).toBe('2021-08-08T07:19:09.775Z');
      expect(result[0].content).toBe('komentar pertama');
      expect(result[0].is_delete).toBe(false);

      expect(result[1].id).toBe('comment-2');
      expect(result[1].username).toBe('dicoding');
      expect(result[1].date).toBe('2021-08-08T08:00:00.000Z');
      expect(result[1].content).toBe('komentar kedua');
      expect(result[1].is_delete).toBe(true);
    });

    it('should return empty array when thread has no comments', async () => {
      // Arrange
      await ThreadsTableTestHelper.addThread({
        id: 'thread-empty',
        owner: 'user-123',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        () => 'dummy',
      );

      // Action
      const result = await commentRepositoryPostgres.getCommentsByThreadId(
        'thread-empty',
      );

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('verifyCommentAvailabilityInThread function', () => {
    it('should throw NotFoundError when comment not in thread', async () => {
      // Arrange
      const repo = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(
        repo.verifyCommentAvailabilityInThread(
          'comment-not-exist',
          'thread-123',
        ),
      ).rejects.toThrow(NotFoundError);
    });

    it('should not throw error when comment exists in thread', async () => {
      // Arrange
      await CommentsTableTestHelper.addComment({
        id: 'comment-thread',
        content: 'halo',
        owner: 'user-123',
        threadId: 'thread-123',
      });

      const repo = new CommentRepositoryPostgres(pool, () => '123');

      // Action & Assert
      await expect(
        repo.verifyCommentAvailabilityInThread('comment-thread', 'thread-123'),
      ).resolves.not.toThrow();
    });
  });
});
