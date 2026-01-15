const CommentDetail = require('../../Domains/comments/entities/CommentDetail');
const ReplyDetail = require('../../Domains/replies/entities/ReplyDetail');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;

    await this._threadRepository.verifyAvailableThread(threadId);

    const thread = await this._threadRepository.getThreadById(threadId);
    const comments = await this._commentRepository.getCommentsByThreadId(
      threadId,
    );

    const commentIds = comments.map((c) => c.id);
    const replies = await this._replyRepository.getRepliesByCommentIds(
      commentIds,
    );

    const detailedComments = comments.map((comment) => {
      const commentReplies = replies
        .filter((reply) => reply.commentId === comment.id)
        .map((reply) => {
          const replyDetail = new ReplyDetail(reply);
          return {
            id: replyDetail.id,
            username: replyDetail.username,
            date: replyDetail.date,
            content: replyDetail.content,
          };
        });

      const commentDetail = new CommentDetail({
        ...comment,
        replies: [],
      });

      return {
        id: commentDetail.id,
        username: commentDetail.username,
        date: commentDetail.date,
        content: commentDetail.content,
        replies: commentReplies,
      };
    });

    return {
      id: thread.id,
      title: thread.title,
      body: thread.body,
      date: thread.date,
      username: thread.username,
      comments: detailedComments,
    };
  }
}

module.exports = GetThreadUseCase;
