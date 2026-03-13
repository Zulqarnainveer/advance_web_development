/**
 * controllers/dashboardController.js
 * Protected dashboard — CRUD for the logged-in user's posts.
 */

const Post         = require('../models/Post');
const User         = require('../models/User');
const path         = require('path');
const fs           = require('fs');
const sanitizeHtml = require('sanitize-html');
const CATEGORIES   = require('../config/categories');

// Sanitize config — allow Quill formatting, strip scripts
const sanitizeOpts = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    'img', 'h1', 'h2', 'h3', 'span', 'u', 's', 'pre', 'code',
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img  : ['src', 'alt', 'width', 'height', 'loading'],
    span : ['class', 'style'],
    pre  : ['class'],
    code : ['class'],
    a    : ['href', 'target', 'rel'],
  },
  allowedSchemes: ['http', 'https', 'data'],
};

/**
 * Safely delete a file (async, non-blocking)
 */
async function safeDeleteFile(filePath) {
  try {
    await fs.promises.access(filePath);
    await fs.promises.unlink(filePath);
  } catch {
    // File doesn't exist or already removed — ignore
  }
}

// GET /dashboard
exports.getDashboard = async (req, res) => {
  try {
    // .populate() demonstration: author info attached to each post
    const posts = await Post.find({ author: req.session.user._id })
      .populate('author', 'username email avatar')
      .sort({ createdAt: -1 });

    const stats = {
      totalPosts    : posts.length,
      published     : posts.filter(p => p.status === 'published').length,
      drafts        : posts.filter(p => p.status === 'draft').length,
      totalViews    : posts.reduce((acc, p) => acc + p.views, 0),
    };

    res.render('dashboard/index', {
      title: 'My Dashboard',
      posts,
      stats,
      user: req.session.user,
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};

// GET /dashboard/posts/create
exports.getCreatePost = (req, res) => {
  res.render('dashboard/create', {
    title   : 'New Post',
    formData: {},
    categories: CATEGORIES,
  });
};

// POST /dashboard/posts/create
exports.postCreatePost = async (req, res) => {
  try {
    const { title, content, category, tags, status } = req.body;
    const tagArray = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Sanitize WYSIWYG content to prevent XSS
    const cleanContent = sanitizeHtml(content, sanitizeOpts);

    const postData = {
      title,
      content : cleanContent,
      category,
      tags   : tagArray,
      status : status || 'published',
      author : req.session.user._id,
    };

    if (req.uploadedFileName) {
      postData.coverImage = req.uploadedFileName;
    }

    await Post.create(postData);
    req.flash('success_msg', 'Post published successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Create post error:', err);
    req.flash('error_msg', 'Failed to create post. ' + err.message);
    res.redirect('/dashboard/posts/create');
  }
};

// GET /dashboard/posts/:id/edit
exports.getEditPost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id   : req.params.id,
      author: req.session.user._id,
    });
    if (!post) {
      req.flash('error_msg', 'Post not found or unauthorised.');
      return res.redirect('/dashboard');
    }
    res.render('dashboard/edit', {
      title: 'Edit Post',
      post,
      categories: CATEGORIES,
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};

// PUT /dashboard/posts/:id
exports.putUpdatePost = async (req, res) => {
  try {
    const post = await Post.findOne({
      _id   : req.params.id,
      author: req.session.user._id,
    });
    if (!post) {
      req.flash('error_msg', 'Post not found or unauthorised.');
      return res.redirect('/dashboard');
    }

    const { title, content, category, tags, status } = req.body;
    post.title    = title;
    post.content  = sanitizeHtml(content, sanitizeOpts);
    post.category = category;
    post.tags     = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];
    post.status   = status || post.status;

    if (req.uploadedFileName) {
      // Remove old image if it is not the default
      if (post.coverImage && post.coverImage !== 'default-cover.jpg') {
        const oldPath = path.join(__dirname, '..', 'public', 'uploads', post.coverImage);
        await safeDeleteFile(oldPath);
      }
      post.coverImage = req.uploadedFileName;
    }

    await post.save();
    req.flash('success_msg', 'Post updated successfully!');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Update post error:', err);
    req.flash('error_msg', 'Failed to update post. ' + err.message);
    res.redirect(`/dashboard/posts/${req.params.id}/edit`);
  }
};

// DELETE /dashboard/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id   : req.params.id,
      author: req.session.user._id,
    });
    if (!post) {
      req.flash('error_msg', 'Post not found or unauthorised.');
      return res.redirect('/dashboard');
    }
    // Clean up image (async)
    if (post.coverImage && post.coverImage !== 'default-cover.jpg') {
      const imgPath = path.join(__dirname, '..', 'public', 'uploads', post.coverImage);
      await safeDeleteFile(imgPath);
    }
    req.flash('success_msg', 'Post deleted successfully.');
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Delete error:', err);
    req.flash('error_msg', 'Failed to delete post.');
    res.redirect('/dashboard');
  }
};

// GET /dashboard/profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id)
      .populate({ path: 'posts', options: { sort: { createdAt: -1 } } });
    res.render('dashboard/profile', { title: 'My Profile', user });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};

// GET /dashboard/settings
exports.getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id);
    const formData = req.flash('formData')[0];
    res.render('dashboard/settings', {
      title: 'Account Settings',
      userData: user,
      formData: formData ? JSON.parse(formData) : {},
    });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};

// POST /dashboard/settings/profile — Update username, email, bio
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio } = req.body;
    const userId = req.session.user._id;

    // Check for duplicate username/email (exclude current user)
    const existing = await User.findOne({
      _id: { $ne: userId },
      $or: [{ email }, { username }],
    });
    if (existing) {
      const field = existing.email === email ? 'Email' : 'Username';
      req.flash('error_msg', `${field} is already taken by another user.`);
      req.flash('formData', JSON.stringify({ username, email, bio }));
      return res.redirect('/dashboard/settings');
    }

    const user = await User.findById(userId);

    // Handle avatar upload
    if (req.uploadedFileName) {
      // Remove old avatar if not default
      if (user.avatar && user.avatar !== 'default-avatar.png') {
        const oldPath = path.join(__dirname, '..', 'public', 'uploads', user.avatar);
        await safeDeleteFile(oldPath);
      }
      user.avatar = req.uploadedFileName;
    }

    user.username = username;
    user.email    = email;
    user.bio      = bio || '';
    await user.save();

    // Update session data
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };

    req.flash('success_msg', 'Profile updated successfully!');
    res.redirect('/dashboard/settings');
  } catch (err) {
    console.error('Update profile error:', err);
    req.flash('error_msg', 'Failed to update profile. ' + err.message);
    res.redirect('/dashboard/settings');
  }
};

// POST /dashboard/settings/password — Change password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.session.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      req.flash('error_msg', 'Current password is incorrect.');
      return res.redirect('/dashboard/settings');
    }

    user.password = newPassword;
    await user.save();

    req.flash('success_msg', 'Password changed successfully!');
    res.redirect('/dashboard/settings');
  } catch (err) {
    console.error('Change password error:', err);
    req.flash('error_msg', 'Failed to change password.');
    res.redirect('/dashboard/settings');
  }
};
