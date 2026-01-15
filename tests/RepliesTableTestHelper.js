/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    owner = 'user-123',
    commentId = 'comment-123',
    isDelete = false,
    date = new Date().toISOString(),
  }) {
    const query = {
      text: `
        INSERT INTO replies (id, comment_id, content, owner, is_delete, date)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      values: [id, commentId, content, owner, isDelete, date],
    };

    await pool.query(query);
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};

module.exports = RepliesTableTestHelper;
