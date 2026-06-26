const { User, Post, Follow, Notification } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const cloudinary = require('../config/cloudinary');
const ApiFeatures = require('../utils/apiFeatures');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(
    User.findAndCountAll({ attributes: { exclude: ['password', 'refresh_token'] } }),
    req.query
  );

  const { count, rows: users } = await User.findAndCountAll({
    attributes: { exclude: ['password', 'refresh_token'] },
    limit: parseInt(req.query.limit, 10) || 10,
    offset: ((parseInt(req.query.page, 10) || 1) - 1) * (parseInt(req.query.limit, 10) || 10),
    order: [['created_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: { users },
    pagination: {
      page: parseInt(req.query.page, 10) || 1,
      limit: parseInt(req.query.limit, 10) || 10,
      total: count,
      pages: Math.ceil(count / (parseInt(req.query.limit, 10) || 10)),
    },
  });
});

exports.getUserByUsername = catchAsync(async (req, res, next) => {
  const user = await User.findOne({
    where: { username: req.params.username },
    attributes: { exclude: ['password', 'refresh_token'] },
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const postCount = await Post.count({ where: { author_id: user.id, status: 'published' } });
  const followersCount = await Follow.count({ where: { following_id: user.id } });
  const followingCount = await Follow.count({ where: { follower_id: user.id } });

  res.status(200).json({
    success: true,
    data: {
      user: {
        ...user.toJSON(),
        post_count: postCount,
        followers_count: followersCount,
        following_count: followingCount,
      },
    },
  });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const { full_name, bio } = req.body;
  const updates = {};

  if (full_name !== undefined) updates.full_name = full_name;
  if (bio !== undefined) updates.bio = bio;

  await req.user.update(updates);

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: req.user.toSafeJSON() },
  });
});

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const b64 = Buffer.from(req.file.buffer).toString('base64');
  const dataURI = `data:${req.file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    folder: 'contentos/avatars',
    transformation: [{ width: 200, height: 200, crop: 'fill' }],
  });

  await req.user.update({ avatar_url: result.secure_url });

  res.status(200).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: { avatar_url: result.secure_url },
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { current_password, new_password } = req.body;

  if (!(await req.user.comparePassword(current_password))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  req.user.password = new_password;
  await req.user.save();

  const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
  const accessToken = generateAccessToken(req.user.id);
  const refreshToken = generateRefreshToken(req.user.id);
  await req.user.update({ refresh_token: refreshToken });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data: { accessToken, refreshToken },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await user.destroy();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ where: { username: req.params.username } });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: posts } = await Post.findAndCountAll({
    where: { author_id: user.id, status: 'published' },
    limit,
    offset,
    order: [['published_at', 'DESC']],
  });

  res.status(200).json({
    success: true,
    data: { posts },
    pagination: { page, limit, total: count, pages: Math.ceil(count / limit) },
  });
});

exports.followUser = catchAsync(async (req, res, next) => {
  if (req.params.id === req.user.id) {
    return next(new AppError('You cannot follow yourself', 400));
  }

  const targetUser = await User.findByPk(req.params.id);
  if (!targetUser) {
    return next(new AppError('User not found', 404));
  }

  const existingFollow = await Follow.findOne({
    where: { follower_id: req.user.id, following_id: req.params.id },
  });

  if (existingFollow) {
    return next(new AppError('Already following this user', 409));
  }

  await Follow.create({ follower_id: req.user.id, following_id: req.params.id });

  await Notification.create({
    user_id: req.params.id,
    type: 'follow',
    title: 'New Follower',
    message: `${req.user.username} started following you`,
    data: { follower_id: req.user.id },
  });

  res.status(201).json({
    success: true,
    message: 'User followed successfully',
  });
});

exports.unfollowUser = catchAsync(async (req, res, next) => {
  const follow = await Follow.findOne({
    where: { follower_id: req.user.id, following_id: req.params.id },
  });

  if (!follow) {
    return next(new AppError('Not following this user', 404));
  }

  await follow.destroy();

  res.status(200).json({
    success: true,
    message: 'User unfollowed successfully',
  });
});

exports.getFollowers = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const followers = await User.findAll({
    include: [{
      model: User,
      as: 'followers',
      where: { id: req.params.id },
      attributes: [],
    }],
    attributes: { exclude: ['password', 'refresh_token'] },
  });

  res.status(200).json({
    success: true,
    data: { followers },
  });
});

exports.getFollowing = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const following = await User.findAll({
    include: [{
      model: User,
      as: 'following',
      where: { id: req.params.id },
      attributes: [],
    }],
    attributes: { exclude: ['password', 'refresh_token'] },
  });

  res.status(200).json({
    success: true,
    data: { following },
  });
});
