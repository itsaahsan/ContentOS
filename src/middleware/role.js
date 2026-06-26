const AppError = require('../utils/AppError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not authenticated', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission for this action', 403));
    }

    next();
  };
};

module.exports = authorize;
