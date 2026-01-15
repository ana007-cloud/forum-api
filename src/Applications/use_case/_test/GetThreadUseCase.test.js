const GetThreadUseCase = require('../GetThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');

describe('GetThreadUseCase', () => {
  it('should orchestrate get thread detail correctly', async () => {
    // Arrange
    const useCasePayload = { threadId: 'thread-123' };

    const mockThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
    };
    const mockComments = [
      {
        id: 'comment-123',
        username: 'johndoe',
        date: '2021-08-08T07:22:33.555Z',
        content: 'sebuah comment',
        is_delete: false,
      },
      {
        id: 'comment-124',
        username: 'dicoding',
        date: '2021-08-08T07:26:21.338Z',
        content: 'komen rahasia',
        is_delete: true,
      },
    ];

    const mockReplies = [
      {
        id: 'reply-123',
        commentId: 'comment-123',
        username: 'ana',
        date: '2021-08-08T07:30:00.000Z',
        content: 'sebuah balasan',
        is_delete: true,
      },
      {
        id: 'reply-124',
        commentId: 'comment-123',
        username: 'budi',
        date: '2021-08-08T07:31:00.000Z',
        content: 'balasan aktif',
        is_delete: false,
      },
    ];

    const expectedThreadDetail = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'johndoe',
          date: '2021-08-08T07:22:33.555Z',
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-123',
              username: 'ana',
              date: '2021-08-08T07:30:00.000Z',
              content: '**balasan telah dihapus**',
            },
            {
              id: 'reply-124',
              username: 'budi',
              date: '2021-08-08T07:31:00.000Z',
              content: 'balasan aktif',
            },
          ],
        },
        {
          id: 'comment-124',
          username: 'dicoding',
          date: '2021-08-08T07:26:21.338Z',
          content: '**komentar telah dihapus**',
          replies: [],
        },
      ],
    };

    // Mock repository
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn(() => Promise.resolve());
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve(mockComments));
    mockReplyRepository.getRepliesByCommentIds = jest.fn(() => Promise.resolve(mockReplies));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockThreadRepository.getThreadById).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockCommentRepository.getCommentsByThreadId).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );
    expect(mockReplyRepository.getRepliesByCommentIds).toHaveBeenCalledWith([
      'comment-123',
      'comment-124',
    ]);

    expect(result).toStrictEqual(expectedThreadDetail);
  });

  it('should return thread detail with empty comments', async () => {
    // Arrange
    const useCasePayload = { threadId: 'thread-123' };

    const mockThread = {
      id: 'thread-123',
      title: 'thread',
      body: 'body',
      date: '2021-08-08',
      username: 'dicoding',
    };

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyAvailableThread = jest.fn();
    mockThreadRepository.getThreadById = jest.fn(() => Promise.resolve(mockThread));
    mockCommentRepository.getCommentsByThreadId = jest.fn(() => Promise.resolve([]));
    mockReplyRepository.getRepliesByCommentIds = jest.fn(() => Promise.resolve([]));

    const useCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    const result = await useCase.execute(useCasePayload);

    // Assert
    expect(result.comments).toEqual([]);
  });
});
