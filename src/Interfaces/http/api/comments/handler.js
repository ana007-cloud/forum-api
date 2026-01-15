const AddCommentUseCase = require('../../../../Applications/use_case/AddCommentUseCase');
const DomainErrorTranslator = require('../../../../Commons/exceptions/DomainErrorTranslator');
const InvariantError = require('../../../../Commons/exceptions/InvariantError');
const DeleteCommentUseCase = require('../../../../Applications/use_case/DeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const { threadId } = request.params;

      const addCommentUseCase = this._container.getInstance(
        AddCommentUseCase.name,
      );

      const addedComment = await addCommentUseCase.execute(
        request.payload,
        threadId,
        credentialId,
      );

      const response = h.response({
        status: 'success',
        data: { addedComment },
      });
      response.code(201);
      return response;
    } catch (error) {
      const translatedError = DomainErrorTranslator.translate(error);

      if (translatedError instanceof InvariantError) {
        const response = h.response({
          status: 'fail',
          message: translatedError.message,
        });
        response.code(400);
        return response;
      }

      // let onPreResponse handle other errors (500)
      throw error;
    }
  }

  async deleteCommentHandler(request) {
    const deleteCommentUseCase = this._container.getInstance(
      DeleteCommentUseCase.name,
    );
    const { threadId, commentId } = request.params;
    const { id: owner } = request.auth.credentials;

    await deleteCommentUseCase.execute({ threadId, commentId, owner });

    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
