const { Post, User, Category, Tag, Like, Bookmark, Comment } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const generateSlug = require('../utils/slugify');
const ApiFeatures = require('../utils/apiFeatures');

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const where = { status: 'published' };

  if (req.query.category) {
    const category = await Category.findOne({ where: { slug: req.query.category } });
    if (category) where.category_id = category.id;
  }

  if (req.query.author) {
    const author = await User.findOne({ where: { username: req.query.author } });
    if (author) where.author_id = author.id;
  }

  if (req.query.featured) {
    where.is_featured = req.query.featured === 'true';
  }

  if (req.query.search) {
    where[Op.or] = [
      { title: { [Op.iLike]: `%${req.query.search}%` } },
      { excerpt: { [Op.iLike]: `%${req.query.search}%` } },
    ];
  }

  let order = [['published_at', 'DESC']];
  if (req.query.sort === 'oldest') order = [['published_at', 'ASC']];
  if (req.query.sort === 'popular') order = [['view_count', 'DESC']];
  if (req.query.sort === 'trending') order = [['view_count', 'DESC'], ['created_at', 'DESC']];

  const include = [
    { model: User, as: 'author', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
    { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] },
    { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
  ];

  if (req.query.tag) {
    const tag = await Tag.findOne({ where: { slug: req.query.tag } });
    if (tag) {
      include[2] = {
        model: Tag,
        as: 'tags',
        where: { id: tag.id },
        attributes: ['id', 'name', 'slug'],
        through: { attributes: [] },
      };
    }
  }

  const { count, rows: posts } = await Post.findAndCountAll({
    where,
    include,
    limit,
    offset,
    order,
    distinct: true,
  });

  res.status(200).json({
    success: true,
    message: 'Posts retrieved successfully',
    data: { posts },
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

exports.getPostBySlug = catchAsync(async (req, res, next) => {
  const post = await Post.findOne({
    where: { slug: req.params.slug },
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
      { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'color'] },
      { model: Tag, as: 'tags', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
    ],
  });

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  await post.increment('view_count');

  const commentCount = await Comment.count({ where: { post_id: post.id } });
  const likeCount = await Like.count({ where: { post_id: post.id } });

  res.status(200).json({
    success: true,
    data: {
      post: {
        ...post.toJSON(),
        comment_count: commentCount,
        like_count: likeCount,
        view_count: post.view_count + 1,
      },
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content, excerpt, category_id, tags, status, cover_image } = req.body;

  let slug = generateSlug(title);
  const existingPost = await Post.findOne({ where: { slug } });
  if (existingPost) {
    slug = `${slug}-${Date.now()}`;
  }

  const postData = {
    title,
    slug,
    content,
    excerpt,
    category_id,
    cover_image,
    author_id: req.user.id,
    status: status || 'draft',
    published_at: status === 'published' ? new Date() : null,
  };

  const post = await Post.create(postData);

  if (tags && Array.isArray(tags)) {
    for (const tagName of tags) {
      let tag = await Tag.findOne({ where: { slug: generateSlug(tagName) } });
      if (!tag) {
        tag = await Tag.create({ name: tagName, slug: generateSlug(tagName) });
      }
      await post.addTag(tag);
    }
  }

  if (category_id) {
    await Category.increment('post_count', { where: { id: category_id } });
  }

  const fullPost = await Post.findByPk(post.id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
      { model: Category, as: 'category' },
      { model: Tag, as: 'tags', through: { attributes: [] } },
    ],
  });

  res.status(201).json({
    success: true,
    message: 'Post created successfully',
    data: { post: fullPost },
  });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only edit your own posts', 403));
  }

  const { title, content, excerpt, category_id, tags, status, cover_image } = req.body;
  const updates = {};

  if (title) {
    updates.title = title;
    let slug = generateSlug(title);
    const existing = await Post.findOne({ where: { slug, id: { [Op.ne]: post.id } } });
    if (existing) slug = `${slug}-${Date.now()}`;
    updates.slug = slug;
  }
  if (content) updates.content = content;
  if (excerpt !== undefined) updates.excerpt = excerpt;
  if (category_id !== undefined) updates.category_id = category_id;
  if (status) {
    updates.status = status;
    if (status === 'published' && !post.published_at) {
      updates.published_at = new Date();
    }
  }
  if (cover_image !== undefined) updates.cover_image = cover_image;

  await post.update(updates);

  if (tags && Array.isArray(tags)) {
    await post.setTags([]);
    for (const tagName of tags) {
      let tag = await Tag.findOne({ where: { slug: generateSlug(tagName) } });
      if (!tag) {
        tag = await Tag.create({ name: tagName, slug: generateSlug(tagName) });
      }
      await post.addTag(tag);
    }
  }

  const fullPost = await Post.findByPk(post.id, {
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'full_name', 'avatar_url'] },
      { model: Category, as: 'category' },
      { model: Tag, as: 'tags', through: { attributes: [] } },
    ],
  });

  res.status(200).json({
    success: true,
    message: 'Post updated successfully',
    data: { post: fullPost },
  });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own posts', 403));
  }

  if (post.category_id) {
    await Category.decrement('post_count', { where: { id: post.category_id } });
  }

  await post.destroy();

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

exports.publishPost = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only publish your own posts', 403));
  }

  await post.update({ status: 'published', published_at: new Date() });

  res.status(200).json({
    success: true,
    message: 'Post published successfully',
    data: { post },
  });
});

exports.archivePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  if (post.author_id !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only archive your own posts', 403));
  }

  await post.update({ status: 'archived' });

  res.status(200).json({
    success: true,
    message: 'Post archived successfully',
    data: { post },
  });
});

exports.getRelatedPosts = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id, {
    include: [
      { model: Tag, as: 'tags', through: { attributes: [] } },
    ],
  });

  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const tagIds = post.tags.map((t) => t.id);

  const related = await Post.findAll({
    where: {
      id: { [Op.ne]: post.id },
      status: 'published',
      [Op.or]: [
        { category_id: post.category_id },
        { id: { [Op.in]: await Post.findAll({ include: [{ model: Tag, as: 'tags', where: { id: { [Op.in]: tagIds } } }], attributes: ['id'] }).then((p) => p.map((x) => x.id)) } },
      ],
    },
    include: [
      { model: User, as: 'author', attributes: ['id', 'username', 'avatar_url'] },
      { model: Tag, as: 'tags', through: { attributes: [] } },
    ],
    limit: 3,
    order: [['view_count', 'DESC']],
    subQuery: false,
  });

  res.status(200).json({
    success: true,
    data: { posts: related },
  });
});

exports.likePost = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const existingLike = await Like.findOne({
    where: { post_id: post.id, user_id: req.user.id },
  });

  if (existingLike) {
    return next(new AppError('Already liked this post', 409));
  }

  await Like.create({ post_id: post.id, user_id: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Post liked successfully',
  });
});

exports.unlikePost = catchAsync(async (req, res, next) => {
  const like = await Like.findOne({
    where: { post_id: req.params.id, user_id: req.user.id },
  });

  if (!like) {
    return next(new AppError('Not liked', 404));
  }

  await like.destroy();

  res.status(200).json({
    success: true,
    message: 'Like removed successfully',
  });
});

exports.getPostLikes = catchAsync(async (req, res, next) => {
  const likes = await Like.findAll({
    where: { post_id: req.params.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar_url'] }],
  });

  res.status(200).json({
    success: true,
    data: { likes, count: likes.length },
  });
});

exports.bookmarkPost = catchAsync(async (req, res, next) => {
  const post = await Post.findByPk(req.params.id);
  if (!post) {
    return next(new AppError('Post not found', 404));
  }

  const existingBookmark = await Bookmark.findOne({
    where: { post_id: post.id, user_id: req.user.id },
  });

  if (existingBookmark) {
    return next(new AppError('Already bookmarked', 409));
  }

  await Bookmark.create({ post_id: post.id, user_id: req.user.id });

  res.status(201).json({
    success: true,
    message: 'Post bookmarked successfully',
  });
});

exports.unbookmarkPost = catchAsync(async (req, res, next) => {
  const bookmark = await Bookmark.findOne({
    where: { post_id: req.params.id, user_id: req.user.id },
  });

  if (!bookmark) {
    return next(new AppError('Not bookmarked', 404));
  }

  await bookmark.destroy();

  res.status(200).json({
    success: true,
    message: 'Bookmark removed successfully',
  });
});

exports.getBookmarkedPosts = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: bookmarks } = await Bookmark.findAndCountAll({
    where: { user_id: req.user.id },
    include: [{
      model: Post,
      as: 'post',
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'avatar_url'] },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
      ],
    }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: { bookmarks },
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});
