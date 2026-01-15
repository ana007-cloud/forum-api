const ReplyDetail = require('../entities/ReplyDetail');

describe('ReplyDetail entity', () => {
  it('should create reply detail correctly when not deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      username: 'user',
      date: '2021-01-01',
      content: 'balasan',
      is_delete: false,
    };

    const reply = new ReplyDetail(payload);

    // Action & Assert
    expect(reply).toEqual({
      id: payload.id,
      username: payload.username,
      date: payload.date,
      content: payload.content,
    });
  });

  it('should mask content when reply is deleted', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      username: 'user',
      date: '2021-01-01',
      content: 'rahasia',
      is_delete: true,
    };

    const reply = new ReplyDetail(payload);

    // Action & Assert
    expect(reply.content).toBe('**balasan telah dihapus**');
  });

  it('should throw error when payload is invalid', () => {
    // Arrange
    const payload = {
      id: 'reply-1',
      username: 'user',
      date: '2021-01-01',
      content: 'balasan',
      // is_delete missing
    };

    // Action & Assert
    expect(() => new ReplyDetail(payload)).toThrow(
      'REPLY_DETAIL.NOT_CONTAIN_NEEDED_PROPERTY',
    );
  });
});
