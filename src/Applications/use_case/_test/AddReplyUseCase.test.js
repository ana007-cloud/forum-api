const AddReplyUseCase = require('../AddReplyUseCase');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');

describe('AddReplyUseCase', () => {
  it('should orchestrate the add reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'sebuah balasan',
      owner: 'user-123',
      threadId: 'thread-123',
      commentId: 'comment-123',
    };

    const mockReplyRepository = {
      addReply: jest.fn(() => Promise.resolve({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      })),
    };

    const mockThreadRepository = {
      verifyAvailableThread: jest.fn(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentAvailabilityInThread: jest.fn(() => Promise.resolve()),
    };

    const addReplyUseCase = new AddReplyUseCase({
      replyRepository: mockReplyRepository,
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    // Action
    const addedReply = await addReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );

    expect(
      mockCommentRepository.verifyCommentAvailabilityInThread,
    ).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);

    expect(mockReplyRepository.addReply).toHaveBeenCalledWith(
      new AddReply({
        content: useCasePayload.content,
        owner: useCasePayload.owner,
        commentId: useCasePayload.commentId,
      }),
    );

    expect(addedReply).toStrictEqual(
      new AddedReply({
        id: 'reply-123',
        content: 'sebuah balasan',
        owner: 'user-123',
      }),
    );
  });
});
