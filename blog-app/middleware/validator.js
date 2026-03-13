/**
 * middleware/validator.js
 * express-validator rule sets for auth & post forms.
 */

const { body, validationResult } = require('express-validator');

// ── Registration Rules ───────────────────────────────────────
const registerRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters.')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
    .matches(/\d/).withMessage('Password must contain at least one number.'),

  body('confirmPassword')
    .notEmpty().withMessage('Please confirm your password.')
    .custom((value, { req }) => {
      if (value !== req.body.password) throw new Error('Passwords do not match.');
      return true;
    }),
];

// ── Login Rules ──────────────────────────────────────────────
const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ── Blog Post Rules ──────────────────────────────────────────
const postRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Post title is required.')
    .isLength({ min: 5, max: 150 }).withMessage('Title must be 5–150 characters.'),

  body('content')
    .trim()
    .notEmpty().withMessage('Post content is required.')
    .isLength({ min: 50 }).withMessage('Content must be at least 50 characters.'),

  body('category')
    .trim()
    .notEmpty().withMessage('Please select a category.'),

  body('tags')
    .optional()
    .trim(),
];

// ── Profile Update Rules ─────────────────────────────
const profileRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required.')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3–20 characters.')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers and underscores.'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),

  body('bio')
    .optional()
    .trim()
    .isLength({ max: 300 }).withMessage('Bio cannot exceed 300 characters.'),
];

// ── Password Change Rules ────────────────────────────
const passwordChangeRules = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters.')
    .matches(/\d/).withMessage('New password must contain at least one number.'),

  body('confirmNewPassword')
    .notEmpty().withMessage('Please confirm your new password.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('New passwords do not match.');
      return true;
    }),
];

// ── Validation Result Handler ────────────────────────────────
const handleValidation = (redirectPath) => (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(e => e.msg);
    req.flash('errors', errorMessages);
    // Preserve form input
    req.flash('formData', JSON.stringify(req.body));
    return res.redirect(redirectPath || 'back');
  }
  next();
};

module.exports = {
  registerRules,
  loginRules,
  postRules,
  profileRules,
  passwordChangeRules,
  handleValidation,
};
