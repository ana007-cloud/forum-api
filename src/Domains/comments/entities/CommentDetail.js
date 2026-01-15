class CommentDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id,
      username,
      date,
      content,
      is_delete: isDelete,
      replies,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.replies = replies;
  }

  _verifyPayload({
    id,
    username,
    date,
    content: _content,
    is_delete: isDelete,
    replies,
  }) {
    if (
      !id
      || !username
      || !date
      || typeof isDelete !== 'boolean'
      || !Array.isArray(replies)
    ) {
      throw new Error('COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = CommentDetail;
