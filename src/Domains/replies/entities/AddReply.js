const InvariantError = require('../../../Commons/exceptions/InvariantError');

class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const { content, owner, commentId } = payload;

    this.content = content;
    this.owner = owner;
    this.commentId = commentId;
  }

  _verifyPayload({ content, owner, commentId }) {
    if (!content || !owner || !commentId) {
      throw new InvariantError('ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof content !== 'string'
      || typeof owner !== 'string'
      || typeof commentId !== 'string'
    ) {
      throw new InvariantError('ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = AddReply;
