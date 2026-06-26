const { Op } = require('sequelize');
const { Post, User, Tag } = require('../models');

exports.search = async (req, res, next) => {
  try {
    const { q, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        error: 'BAD_REQUEST',
        statusCode: 400,
      });
    }

    const results = {};

    if (!type || type === 'posts') {
      const { count, rows: posts } = await Post.findAndCountAll({
        where: {
          status: 'published',
          [Op.or]: [
            { title: { [Op.iLike]: `%${q}%` } },
            { content: { [Op.iLike]: `%${q}%` } },
            { excerpt: { [Op.iLike]: `%${q}%` } },
          ],
        },
        include: [
          { model: User, as: 'author', attributes: ['id', 'username', 'avatar_url'] },
        ],
        limit: parseInt(limit, 10),
        offset,
        order: [['created_at', 'DESC']],
      });
      results.posts = { items: posts, count };
    }

    if (!type || type === 'users') {
      const { count, rows: users } = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { username: { [Op.iLike]: `%${q}%` } },
            { full_name: { [Op.iLike]: `%${q}%` } },
          ],
        },
        attributes: { exclude: ['password', 'refresh_token'] },
        limit: parseInt(limit, 10),
        offset,
      });
      results.users = { items: users, count };
    }

    if (!type || type === 'tags') {
      const { count, rows: tags } = await Tag.findAndCountAll({
        where: { name: { [Op.iLike]: `%${q}%` } },
        limit: parseInt(limit, 10),
        offset,
      });
      results.tags = { items: tags, count };
    }

    res.status(200).json({
      success: true,
      message: 'Search results retrieved',
      data: results,
    });
  } catch (error) {
    next(error);
  }
};
