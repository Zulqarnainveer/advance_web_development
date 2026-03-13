/**
 * middleware/auth.js
 * Protects routes — redirects unauthenticated users to login.
 */

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error_msg', '🔒 Please log in to access the dashboard.');
  res.redirect('/auth/login');
};

const isGuest = (req, res, next) => {
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};

module.exports = { isAuthenticated, isGuest };
