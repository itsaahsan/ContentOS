const { body } = require('express-validator');

const createCommentValidator = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
  body('parent_id')
    .optional()
    .isUUID()
    .withMessage('Parent comment must be a valid UUID'),
];

const updateCommentValidator = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Comment must be between 1 and 2000 characters'),
];

module.exports = { createCommentValidator, updateCommentValidator };
