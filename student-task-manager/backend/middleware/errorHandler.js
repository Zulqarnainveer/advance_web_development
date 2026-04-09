// ============================================================
// middleware/errorHandler.js
// Global Express error handling middleware
// LAB 7 Concept: Centralized error handling
// ============================================================

const { appendLog } = require('../modules/fileLogger');

/**
 * Global Error Handler Middleware.
 * Express recognizes a 4-argument function as an error handler.
 * Must be registered LAST in app.js after all routes.
 *
 * @param {Error}  err  - The error object
 * @param {Object} req  - Express request object
 * @param {Object} res  - Express response object
 * @param {Function} next - Next middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log the error to our file system log
  appendLog('ERROR', `${req.method} ${req.originalUrl} — ${message}`);
  console.error(`🔴 ERROR: ${message}`, err.stack);

  // Handle Mongoose Validation Errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${errors.join(', ')}`;
  }

  // Handle Mongoose Duplicate Key Error (e.g., duplicate email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value: '${err.keyValue[field]}' already exists for ${field}.`;
  }

  // Handle Mongoose Cast Error (e.g., invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired.';
  }

  // Send JSON error response
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    // Show stack trace only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
