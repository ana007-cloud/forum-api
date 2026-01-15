const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const pool = require('../../database/postgres/pool');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

// Test helpers for setup and teardown
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('ThreadRepositoryPostgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should be instance of ThreadRepository', () => {
    // Arrange & Assert
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {});
    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  it('should use default nanoid when idGenerator not provided', () => {
    // When idGenerator is not provided, repository should use default nanoid
    const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);
    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
    expect(typeof threadRepositoryPostgres._idGenerator()).toBe('string');
    expect(threadRepositoryPostgres._idGenerator().length).toBeGreaterThan(0);
  });

  describe('addThread function', () => {
    it('should persist new thread and return added thread correctly', async () => {
      // Arrange
      const owner = 'user-123';
      await UsersTableTestHelper.addUser({ id: owner });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      const newThread = {
        title: 'sebuah thread',
        body: 'sebuah body thread',
      };

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(
        newThread,
        owner,
      );

      // Assert
      const threads = await ThreadsTableTestHelper.findThreadsById(
        'thread-123',
      );
      expect(threads).toHaveLength(1);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: newThread.title,
          owner,
        }),
      );
    });
  });

  describe('verifyAvailableThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator,
      );

      // Act & Assert
      await expect(
        threadRepositoryPostgres.verifyAvailableThread('thread-xxx'),
      ).rejects.toThrowError('thread tidak ditemukan');
    });

    it('should not throw error when thread exists', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-123' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        owner: 'user-123',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Act & Assert
      await expect(
        threadRepositoryPostgres.verifyAvailableThread('thread-123'),
      ).resolves.not.toThrow();
    });
  });

  describe('ThreadRepositoryPostgres.getThreadById', () => {
    it('should return thread detail correctly', async () => {
      // Arrange
      const userId = 'user-123';
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        owner: userId,
        date: '2021-08-08T07:19:09.775Z',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action
      const thread = await threadRepositoryPostgres.getThreadById('thread-123');

      // Assert
      expect(thread).toStrictEqual({
        id: 'thread-123',
        title: 'sebuah thread',
        body: 'sebuah body thread',
        date: '2021-08-08T07:19:09.775Z',
        username: 'dicoding',
      });
    });

    it('should throw NotFoundError when thread not found', async () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      // Action & Assert
      await expect(
        threadRepositoryPostgres.getThreadById('thread-999'),
      ).rejects.toThrowError(NotFoundError);
    });
  });
});
