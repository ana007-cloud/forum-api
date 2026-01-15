const AddReply = require('../../Domains/replies/entities/AddReply');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class AddReplyUseCase {
  constructor({ replyRepository, threadRepository, commentRepository }) {
    this._replyRepository = replyRepository;
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute({
    content, owner, threadId, commentId,
  }) {
    await this._threadRepository.verifyAvailableThread(threadId);
    await this._commentRepository.verifyCommentAvailabilityInThread(
      commentId,
      threadId,
    );

    const addReply = new AddReply({
      content,
      owner,
      commentId,
    });

    const addedReply = await this._replyRepository.addReply(addReply);

    return new AddedReply(addedReply);
  }
}

module.exports = AddReplyUseCase;
