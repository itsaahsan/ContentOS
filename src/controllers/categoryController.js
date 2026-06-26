const { Category, Post } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateSlug = require('../utils/slugify');

exports.getAllCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.findAll({
    order: [['name', 'ASC']],
  });

  res.status(200).json({
    success: true,
    message: 'Categories retrieved successfully',
    data: { categories },
  });
});

exports.getCategoryBySlug = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ where: { slug: req.params.slug } });

  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { category },
  });
});

exports.createCategory = catchAsync(async (req, res, next) => {
  const { name, description, color, icon } = req.body;

  const slug = generateSlug(name);
  const existing = await Category.findOne({ where: { slug } });
  if (existing) {
    return next(new AppError('Category already exists', 409));
  }

  const category = await Category.create({
    name,
    slug,
    description,
    color: color || '#6366F1',
    icon,
  });

  res.status(201).json({
    success: true,
    message: 'Category created successfully',
    data: { category },
  });
});

exports.updateCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const { name, description, color, icon } = req.body;
  const updates = {};

  if (name) {
    updates.name = name;
    updates.slug = generateSlug(name);
  }
  if (description !== undefined) updates.description = description;
  if (color) updates.color = color;
  if (icon !== undefined) updates.icon = icon;

  await category.update(updates);

  res.status(200).json({
    success: true,
    message: 'Category updated successfully',
    data: { category },
  });
});

exports.deleteCategory = catchAsync(async (req, res, next) => {
  const category = await Category.findByPk(req.params.id);
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const postCount = await Post.count({ where: { category_id: category.id } });
  if (postCount > 0) {
    return next(new AppError('Cannot delete category with posts', 400));
  }

  await category.destroy();

  res.status(200).json({
    success: true,
    message: 'Category deleted successfully',
  });
});

exports.getCategoryPosts = catchAsync(async (req, res, next) => {
  const category = await Category.findOne({ where: { slug: req.params.slug } });
  if (!category) {
    return next(new AppError('Category not found', 404));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: posts } = await Post.findAndCountAll({
    where: { category_id: category.id, status: 'published' },
    include: [
      { model: require('../models').User, as: 'author', attributes: ['id', 'username', 'avatar_url'] },
    ],
    limit,
    offset,
    order: [['published_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: { posts, category },
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});
