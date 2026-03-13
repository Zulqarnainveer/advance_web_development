/**
 * routes/dashboardRoutes.js
 */
const express = require('express');
const router  = express.Router();
const dashController = require('../controllers/dashboardController');
const { isAuthenticated }  = require('../middleware/auth');
const { validateImage, requireImage, moveUploadedFile } = require('../middleware/upload');
const { postRules, profileRules, passwordChangeRules, handleValidation } = require('../middleware/validator');

// Apply auth guard to all dashboard routes
router.use(isAuthenticated);

router.get('/', dashController.getDashboard);
router.get('/profile', dashController.getProfile);

// ── Settings ─────────────────────────────────────────
router.get('/settings', dashController.getSettings);
router.post('/settings/profile',
  profileRules,
  handleValidation('/dashboard/settings'),
  validateImage,
  moveUploadedFile,
  dashController.updateProfile
);
router.post('/settings/password',
  passwordChangeRules,
  handleValidation('/dashboard/settings'),
  dashController.updatePassword
);

// ── Create post ──────────────────────────────────────
router.get('/posts/create', dashController.getCreatePost);
router.post('/posts/create',
  postRules,
  handleValidation('/dashboard/posts/create'),
  requireImage,
  validateImage,
  moveUploadedFile,
  dashController.postCreatePost
);

// ── Edit post ────────────────────────────────────────
router.get('/posts/:id/edit', dashController.getEditPost);
router.put('/posts/:id',
  postRules,
  handleValidation('back'),
  validateImage,
  moveUploadedFile,
  dashController.putUpdatePost
);

// ── Delete post ──────────────────────────────────────
router.delete('/posts/:id', dashController.deletePost);

module.exports = router;
