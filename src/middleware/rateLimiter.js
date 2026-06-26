const rateLimit = require('express-rate-limit');

const passthrough = (req, res, next) => next();

const globalLimiter = process.env.NODE_ENV === 'test'
  ? passthrough
  : rateLimit({
      windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 15) * 60 * 1000,
      max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
      message: {
        success: false,
        message: 'Too many requests, please try again later',
        error: 'TOO_MANY_REQUESTS',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

const authLimiter = process.env.NODE_ENV === 'test'
  ? passthrough
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: {
        success: false,
        message: 'Too many auth attempts, please try again after 15 minutes',
        error: 'TOO_MANY_REQUESTS',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

const uploadLimiter = process.env.NODE_ENV === 'test'
  ? passthrough
  : rateLimit({
      windowMs: 60 * 60 * 1000,
      max: 10,
      message: {
        success: false,
        message: 'Too many upload requests, please try again after 1 hour',
        error: 'TOO_MANY_REQUESTS',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

module.exports = { globalLimiter, authLimiter, uploadLimiter };
