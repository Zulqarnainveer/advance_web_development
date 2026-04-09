// ============================================================
// middleware/requestLogger.js
// Custom Express middleware for logging HTTP requests
// LAB 2 & 7 Concept: Middleware implementation
// ============================================================

const { appendLog } = require('../modules/fileLogger');

/**
 * Custom request logging middleware.
 * Logs method, URL, IP, and response time to both console and logs.txt.
 * This runs on EVERY incoming request before reaching the route handler.
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // Log to console with colors
  console.log(`📩 [${method}] ${originalUrl} — from ${ip}`);

  // Once the response is finished, log the status code and time taken
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const logMessage = `${method} ${originalUrl} ${statusCode} — ${duration}ms — IP: ${ip}`;

    // Write to logs.txt using our custom fs module
    appendLog('INFO', logMessage);

    // Color-coded console output for status codes
    if (statusCode >= 500) {
      console.error(`❌ [${statusCode}] ${originalUrl} (${duration}ms)`);
    } else if (statusCode >= 400) {
      console.warn(`⚠️  [${statusCode}] ${originalUrl} (${duration}ms)`);
    } else {
      console.log(`✅ [${statusCode}] ${originalUrl} (${duration}ms)`);
    }
  });

  next(); // Pass control to the next middleware or route
};

module.exports = requestLogger;
