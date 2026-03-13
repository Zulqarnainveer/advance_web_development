/**
 * controllers/authController.js
 * Handles user registration, login, and logout.
 */

const User = require('../models/User');

// GET /auth/register
exports.getRegister = (req, res) => {
  const formData = req.flash('formData')[0];
  res.render('auth/register', {
    title: 'Create Account',
    formData: formData ? JSON.parse(formData) : {},
  });
};

// POST /auth/register
exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      req.flash('error_msg', `${field} is already registered. Please log in.`);
      req.flash('formData', JSON.stringify({ username, email }));
      return res.redirect('/auth/register');
    }
    await User.create({ username, email, password });
    req.flash('success_msg', 'Account created successfully! Please log in.');
    res.redirect('/auth/login');
  } catch (err) {
    console.error('Register error:', err);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    res.redirect('/auth/register');
  }
};

// GET /auth/login
exports.getLogin = (req, res) => {
  const formData = req.flash('formData')[0];
  res.render('auth/login', {
    title: 'Sign In',
    formData: formData ? JSON.parse(formData) : {},
  });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      req.flash('error_msg', 'No account found with that email.');
      req.flash('formData', JSON.stringify({ email }));
      return res.redirect('/auth/login');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      req.flash('error_msg', 'Incorrect password. Please try again.');
      req.flash('formData', JSON.stringify({ email }));
      return res.redirect('/auth/login');
    }
    req.session.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
    req.session.save(() => {
      req.flash('success_msg', `Welcome back, ${user.username}!`);
      res.redirect('/dashboard');
    });
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error_msg', 'Something went wrong. Please try again.');
    res.redirect('/auth/login');
  }
};

// POST /auth/logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/auth/login');
  });
};
