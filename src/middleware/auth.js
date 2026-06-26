const { verifyToken } = require('../utils/generateToken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const authenticate = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in.', 401));
  }

  let decoded;
  try {
    decoded = verifyToken(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }

  const user = await User.findByPk(decoded.id);
  if (!user) {
    return next(new AppError('User no longer exists', 401));
  }

  if (!user.is_active) {
    return next(new AppError('Your account has been deactivated', 401));
  }

  req.user = user;
  next();
});

const optionalAuth = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (user && user.is_active) {
      req.user = user;
    }
  } catch (err) {
    // Token invalid, continue without user
  }

  next();
});

module.exports = { authenticate, optionalAuth };
