const CommentDetail = require('../entities/CommentDetail');

describe('CommentDetail entity', () => {
  it('should create comment detail correctly when not deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: '2021-01-01',
      content: 'sebuah komentar',
      is_delete: false,
      replies: [],
    };

    const comment = new CommentDetail(payload);

    // Action & Assert
    expect(comment).toEqual({
      id: payload.id,
      username: payload.username,
      date: payload.date,
      content: payload.content,
      replies: [],
    });
  });

  it('should mask content when comment is deleted', () => {
    // Arrange
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: '2021-01-01',
      content: 'rahasia',
      is_delete: true,
      replies: [],
    };

    const comment = new CommentDetail(payload);

    // Action & Assert
    expect(comment.content).toBe('**komentar telah dihapus**');
  });

  it('should throw error when payload is invalid', () => {
    // Arrange
    const payload = {
      id: 'comment-1',
      username: 'user',
      date: '2021-01-01',
      content: 'sebuah komentar',
      // is_delete missing
      replies: [],
    };

    // Action & Assert
    expect(() => new CommentDetail(payload)).toThrow(
      'COMMENT_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });
});
