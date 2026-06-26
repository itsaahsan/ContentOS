const { Comment, User, Post } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

exports.getPostComments = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const comments = await Comment.findAll({
    where: { post_id: req.params.id, parent_id: null, is_approved: true },
    include: [
      { model: User, as: 'user', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
      {
        model: Comment,
        as: 'replies',
        where: { is_approved: true },
        required: false,
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'full_name', 'avatar_url'] }],
      },
    ],
    order: [['created_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: { comments },
  });
});

exports.createComment = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const { content, parent_id } = req.body;

  if (parent_id) {
    const parentComment = await Comment.findOne({
      where: { id: parent_id, post_id: req.params.id },
    });
    if (!parentComment) {
      return next(new AppError('Parent comment not found', 404));
    }
  }

  const comment = await Comment.create({
    post_id: req.params.id,
    user_id: req.user.id,
    content,
    parent_id: parent_id || null,
  });

  const fullComment = await Comment.findByPk(comment.id, {
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'full_name', 'avatar_url'] }],
  });

  res.status(201).json({
    success: true,
    message: 'Comment created successfully',
    data: { comment: fullComment },
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findByPk(req.params.id);

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.user_id !== req.user.id) {
    return next(new AppError('You can only edit your own comments', 403));
  }

  await comment.update({ content: req.body.content });

  res.status(200).json({
    success: true,
    message: 'Comment updated successfully',
    data: { comment },
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findByPk(req.params.id);

  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own comments', 403));
  }

  await comment.destroy();

  res.status(200).json({
    success: true,
    message: 'Comment deleted successfully',
  });
});

exports.likeComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  await comment.increment('likes_count');

  res.status(200).json({
    success: true,
    message: 'Comment liked successfully',
  });
});

exports.approveComment = catchAsync(async (req, res, next) => {
  const comment = await Comment.findByPk(req.params.id);
  if (!comment) {
    return next(new AppError('Comment not found', 404));
  }

  await comment.update({ is_approved: true });

  res.status(200).json({
    success: true,
    message: 'Comment approved successfully',
    data: { comment },
  });
});
