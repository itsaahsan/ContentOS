const { Tag, Post, User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateSlug = require('../utils/slugify');

exports.getAllTags = catchAsync(async (req, res, next) => {
  const tags = await Tag.findAll({ order: [['name', 'ASC']] });

  res.status(200).json({
    success: true,
    message: 'Tags retrieved successfully',
    data: { tags },
  });
});

exports.getTagBySlug = catchAsync(async (req, res, next) => {
  const tag = await Tag.findOne({ where: { slug: req.params.slug } });

  if (!tag) {
    return next(new AppError('Tag not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { tag },
  });
});

exports.createTag = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const slug = generateSlug(name);
  const existing = await Tag.findOne({ where: { slug } });
  if (existing) {
    return next(new AppError('Tag already exists', 409));
  }

  const tag = await Tag.create({ name, slug });

  res.status(201).json({
    success: true,
    message: 'Tag created successfully',
    data: { tag },
  });
});

exports.getTagPosts = catchAsync(async (req, res, next) => {
  const tag = await Tag.findOne({ where: { slug: req.params.slug } });
  if (!tag) {
    return next(new AppError('Tag not found', 404));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const posts = await tag.getPosts({
    where: { status: 'published' },
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar_url'] },
    ],
    limit,
    offset,
    order: [['published_at', 'DESC']],
    through: { attributes: [] },
  });

  const count = await tag.countPosts({ where: { status: 'published' } });

  res.status(200).json({
    success: true,
    data: { posts, tag },
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});
