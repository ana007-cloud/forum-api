const AddCommentUseCase = require('../AddCommentUseCase');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('AddCommentUseCase', () => {
  let addCommentUseCase;
  let mockCommentRepository;
  let mockThreadRepository;

  beforeEach(() => {
    mockCommentRepository = new CommentRepository();
    mockThreadRepository = new ThreadRepository();

    addCommentUseCase = new AddCommentUseCase({
      commentRepository: mockCommentRepository,
      threadRepository: mockThreadRepository,
    });
  });

  it('should throw error when payload does not contain content property', async () => {
    // Action & Assert
    await expect(
      addCommentUseCase.execute({}, 'thread-123', 'user-123'),
    ).rejects.toThrowError('ADD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when content is not a string', async () => {
    // Action & Assert
    await expect(
      addCommentUseCase.execute({ content: 123 }, 'thread-123', 'user-123'),
    ).rejects.toThrowError(
      'ADD_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION',
    );
  });

  it('should orchestrate the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah komentar',
    };
    const threadId = 'thread-123';
    const owner = 'user-123';

    const expectedAddedComment = new AddedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner,
    });

    mockThreadRepository.verifyAvailableThread = jest.fn().mockResolvedValue();

    mockCommentRepository.addComment = jest
      .fn()
      .mockResolvedValue(expectedAddedComment);

    // Action
    const addedComment = await addCommentUseCase.execute(
      useCasePayload,
      threadId,
      owner,
    );

    // Assert
    expect(addedComment).toStrictEqual(expectedAddedComment);

    expect(mockThreadRepository.verifyAvailableThread).toBeCalledWith(threadId);

    expect(mockCommentRepository.addComment).toBeCalledWith(
      new AddComment(useCasePayload),
      threadId,
      owner,
    );
  });

  it('should rethrow error when AddComment throws unexpected error', async () => {
    // Arrange
    const payload = { content: 'komentar' };
    const threadId = 'thread-123';
    const owner = 'user-123';

    jest
      .spyOn(AddComment.prototype, '_verifyPayload')
      .mockImplementation(() => {
        throw new Error('UNEXPECTED_ERROR');
      });

    // Action & Assert
    await expect(
      addCommentUseCase.execute(payload, threadId, owner),
    ).rejects.toThrowError('UNEXPECTED_ERROR');
  });
});
