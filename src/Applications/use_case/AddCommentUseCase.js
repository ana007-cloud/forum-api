const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ commentRepository, threadRepository }) {
    this._commentRepository = commentRepository;
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, owner) {
    let addComment;

    try {
      addComment = new AddComment(useCasePayload);
    } catch (error) {
      if (error.message === 'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY') {
        throw new Error('ADD_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
      }

      if (error.message === 'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION') {
        throw new Error(
          'ADD_COMMENT_USE_CASE.NOT_MEET_DATA_TYPE_SPECIFICATION',
        );
      }

      throw error;
    }

    await this._threadRepository.verifyAvailableThread(threadId);

    return this._commentRepository.addComment(addComment, threadId, owner);
  }
}

module.exports = AddCommentUseCase;
