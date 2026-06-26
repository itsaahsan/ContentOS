const { body } = require('express-validator');

const createPostValidator = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage('Title must be between 3 and 300 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt must be less than 500 characters'),
  body('category_id')
    .optional()
    .isInt()
    .withMessage('Category must be a valid integer'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published'])
    .withMessage('Status must be draft or published'),
  body('cover_image')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL'),
];

const updatePostValidator = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 300 })
    .withMessage('Title must be between 3 and 300 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('excerpt')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Excerpt must be less than 500 characters'),
  body('category_id')
    .optional()
    .isInt()
    .withMessage('Category must be a valid integer'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
];

module.exports = { createPostValidator, updatePostValidator };
