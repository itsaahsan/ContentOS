const { User, Post, Comment, Like, sequelize } = require('../models');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res, next) => {
  const totalUsers = await User.count();
  const totalPosts = await Post.count({ where: { status: 'published' } });
  const totalComments = await Comment.count();
  const totalViews = await Post.sum('view_count') || 0;
  const totalLikes = await Like.count();

  res.status(200).json({
    success: true,
    data: {
      overview: {
        total_users: totalUsers,
        total_posts: totalPosts,
        total_comments: totalComments,
        total_views: totalViews,
        total_likes: totalLikes,
      },
    },
  });
});

exports.getPostsStats = catchAsync(async (req, res, next) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const postsPerMonth = await Post.findAll({
    attributes: [
      [sequelize.fn('date_trunc', 'month', sequelize.col('created_at')), 'month'],
      [sequelize.fn('count', sequelize.col('id')), 'count'],
    ],
    where: {
      created_at: { [Op.gte]: sixMonthsAgo },
    },
    group: [sequelize.fn('date_trunc', 'month', sequelize.col('created_at'))],
    order: [[sequelize.fn('date_trunc', 'month', sequelize.col('created_at')), 'ASC']],
    raw: true,
  });

  res.status(200).json({
    success: true,
    data: { posts_per_month: postsPerMonth },
  });
});

exports.getPopularPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.findAll({
    where: { status: 'published' },
    include: [
      { model: require('../models').User, as: 'author', attributes: ['id', 'username', 'avatar_url'] },
    ],
    order: [['view_count', 'DESC']],
    limit: 10,
  });

  res.status(200).json({
    success: true,
    data: { popular_posts: posts },
  });
});
