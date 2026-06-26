const { User } = require('../models');
const { generateAccessToken, generateRefreshToken, generateResetToken, verifyToken } = require('../utils/generateToken');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/sendEmail');
const { Op } = require('sequelize');

exports.register = catchAsync(async (req, res, next) => {
  const { username, email, password, full_name } = req.body;

  const existingUser = await User.findOne({
    where: { [Op.or]: [{ email }, { username }] },
  });

  if (existingUser) {
    return next(new AppError(
      existingUser.email === email ? 'Email already in use' : 'Username already taken',
      409
    ));
  }

  const user = await User.create({ username, email, password, full_name });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await user.update({ refresh_token: refreshToken });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid email or password', 401));
  }

  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await user.update({ refresh_token: refreshToken, last_login: new Date() });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toSafeJSON(),
      accessToken,
      refreshToken,
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  await req.user.update({ refresh_token: null });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  let decoded;
  try {
    decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  const user = await User.findByPk(decoded.id);
  if (!user || user.refresh_token !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  const newAccessToken = generateAccessToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id);

  await user.update({ refresh_token: newRefreshToken });

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    },
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return next(new AppError('No user found with this email', 404));
  }

  const resetToken = generateResetToken(user.id);
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - ContentOS',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${user.full_name || user.username},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background:#6366F1;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>This link expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch (err) {
    return next(new AppError('Failed to send email. Please try again later.', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded;
  try {
    decoded = verifyToken(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired reset token', 400));
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.password = password;
  user.refresh_token = null;
  await user.save();

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await user.update({ refresh_token: refreshToken });

  res.status(200).json({
    success: true,
    message: 'Password reset successful',
    data: {
      accessToken,
      refreshToken,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: { user: req.user.toSafeJSON() },
  });
});
