class ReplyDetail {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, date, content, is_delete: isDelete,
    } = payload;

    this.id = id;
    this.username = username;
    this.date = date;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
  }

  _verifyPayload({
    id,
    username,
    date,
    content: _content,
    is_delete: isDelete,
  }) {
    if (!id || !username || !date || typeof isDelete !== 'boolean') {
      throw new Error('REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY');
    }
  }
}

module.exports = ReplyDetail;
