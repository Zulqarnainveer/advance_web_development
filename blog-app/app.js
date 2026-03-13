/**
 * ============================================================
 *  BLOG APP — Entry Point (app.js)
 *  MVC Architecture | Node.js + Express + MongoDB
 * ============================================================
 */

require('dotenv').config();
const express       = require('express');
const session       = require('express-session');
const flash         = require('connect-flash');
const fileUpload    = require('express-fileupload');
const methodOverride = require('method-override');
const path          = require('path');
const os            = require('os');

const connectDB     = require('./config/db');
const logger        = require('./middleware/logger');

// ── Route Imports ────────────────────────────────────────────
const authRoutes      = require('./routes/authRoutes');
const blogRoutes      = require('./routes/blogRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// ── Initialise App ───────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

// ── Connect to MongoDB ───────────────────────────────────────
connectDB();

// ── View Engine ──────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ── Static Files ─────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Core Middleware ──────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ── File Upload Middleware ───────────────────────────────────
app.use(fileUpload({
  useTempFiles   : true,
  tempFileDir    : os.tmpdir(),
  limits         : { fileSize: 5 * 1024 * 1024 }, // 5 MB
  abortOnLimit   : true,
}));

// ── Session ──────────────────────────────────────────────────
app.use(session({
  secret           : process.env.SESSION_SECRET || 'fallback_secret',
  resave           : false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure  : process.env.NODE_ENV === 'production',
    maxAge  : 1000 * 60 * 60 * 24, // 24 hours
  },
}));

// ── Flash Messages ───────────────────────────────────────────
app.use(flash());

// ── Custom Request Logger Middleware ─────────────────────────
app.use(logger);

// ── Global Template Locals ───────────────────────────────────
app.use((req, res, next) => {
  res.locals.user          = req.session.user || null;
  res.locals.success_msg   = req.flash('success_msg');
  res.locals.error_msg     = req.flash('error_msg');
  res.locals.errors        = req.flash('errors');
  next();
});

// ── Routes ───────────────────────────────────────────────────
app.use('/auth',      authRoutes);
app.use('/blog',      blogRoutes);
app.use('/dashboard', dashboardRoutes);

// ── Home Route ───────────────────────────────────────────────
app.get('/', (req, res) => res.redirect('/blog'));

// ── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found' });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).render('500', { title: 'Server Error', error: err.message });
});

// ── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Blog App running → http://localhost:${PORT}`);
  console.log(`📁 Environment    → ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
