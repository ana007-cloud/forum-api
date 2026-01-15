const DeleteReplyUseCase = require('../DeleteReplyUseCase');

describe('DeleteReplyUseCase', () => {
  it('should orchestrate delete reply action correctly', async () => {
    // Arrange
    const useCasePayload = {
      threadId: 'thread-123',
      commentId: 'comment-123',
      replyId: 'reply-123',
      owner: 'user-123',
    };

    const mockThreadRepository = {
      verifyAvailableThread: jest.fn(() => Promise.resolve()),
    };

    const mockCommentRepository = {
      verifyCommentAvailabilityInThread: jest.fn(() => Promise.resolve()),
    };

    const mockReplyRepository = {
      verifyReplyOwner: jest.fn(() => Promise.resolve()),
      deleteReplyById: jest.fn(() => Promise.resolve()),
    };

    const deleteReplyUseCase = new DeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    // Action
    await deleteReplyUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.verifyAvailableThread).toHaveBeenCalledWith(
      useCasePayload.threadId,
    );

    expect(
      mockCommentRepository.verifyCommentAvailabilityInThread,
    ).toHaveBeenCalledWith(useCasePayload.commentId, useCasePayload.threadId);

    expect(mockReplyRepository.verifyReplyOwner).toHaveBeenCalledWith(
      useCasePayload.replyId,
      useCasePayload.owner,
    );

    expect(mockReplyRepository.deleteReplyById).toHaveBeenCalledWith(
      useCasePayload.replyId,
    );
  });
});
