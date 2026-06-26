const { body } = require('express-validator');

const updateProfileValidator = [
  body('full_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name must be less than 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
];

const changePasswordValidator = [
  body('current_password')
    .notEmpty()
    .withMessage('Current password is required'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number')
    .matches(/[a-zA-Z]/)
    .withMessage('New password must contain at least one letter'),
];

module.exports = { updateProfileValidator, changePasswordValidator };
