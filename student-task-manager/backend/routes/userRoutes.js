// ============================================================
// routes/userRoutes.js
// RESTful API routes for User Authentication
// LAB 2 & 7: Routing, POST/GET handling
// ============================================================

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { appendLog } = require('../modules/fileLogger');

// ============================================================
// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
// ============================================================
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    // Create new user — password will be hashed by pre-save hook
    const user = await User.create({ name, email, password, role });

    // Log this event
    appendLog('INFO', `New user registered: ${email}`);

    // Generate JWT
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error); // Forward to global error handler
  }
});

// ============================================================
// @route   POST /api/users/login
// @desc    Login user and return JWT token
// @access  Public
// ============================================================
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // Find user and explicitly select password (it's hidden by default)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    appendLog('INFO', `User logged in: ${email}`);
    const token = user.generateAuthToken();

    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   GET /api/users/me
// @desc    Get current logged-in user's profile
// @access  Private (requires JWT)
// ============================================================
router.get('/me', protect, async (req, res, next) => {
  try {
    // req.user is attached by the protect middleware
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   PUT /api/users/me
// @desc    Update current user's profile
// @access  Private
// ============================================================
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, avatar } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   GET /api/users  (Admin only)
// @desc    Get all users
// @access  Private/Admin
// ============================================================
router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required.' });
    }

    const users = await User.find().select('-password');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
