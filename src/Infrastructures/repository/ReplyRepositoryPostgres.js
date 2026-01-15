const ReplyRepository = require('../../Domains/replies/ReplyRepository');
const AddedReply = require('../../Domains/replies/entities/AddedReply');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(addReply) {
    const { content, owner, commentId } = addReply;
    const id = `reply-${this._idGenerator()}`;

    const query = {
      text: `
        INSERT INTO replies (id, content, owner, comment_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id, content, owner
      `,
      values: [id, content, owner, commentId],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT owner FROM replies WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new Error('REPLY.NOT_FOUND');
    }

    if (result.rows[0].owner !== owner) {
      throw new Error('REPLY.NOT_OWNED');
    }
  }

  async deleteReplyById(replyId) {
    const query = {
      text: 'UPDATE replies SET is_delete = TRUE WHERE id = $1',
      values: [replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new Error('REPLY.NOT_FOUND');
    }
  }

  async getRepliesByCommentIds(commentIds) {
    if (!commentIds.length) return [];

    const query = {
      text: `
      SELECT
        replies.id,
        replies.content,
        replies.date,
        replies.comment_id,
        replies.is_delete,
        users.username
      FROM replies
      LEFT JOIN users ON users.id = replies.owner
      WHERE replies.comment_id = ANY($1::text[])
      ORDER BY replies.date ASC
    `,
      values: [commentIds],
    };

    const result = await this._pool.query(query);

    return result.rows.map((row) => ({
      id: row.id,
      content: row.content,
      date: row.date,
      username: row.username,
      commentId: row.comment_id,
      is_delete: row.is_delete,
    }));
  }
}

module.exports = ReplyRepositoryPostgres;
