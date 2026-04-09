// ============================================================
// modules/fileLogger.js
// Custom module using Node.js built-in 'fs' module
// LAB 1 Concept: fs module for async file operations
// ============================================================

const fs = require('fs');
const path = require('path');

// Path to the logs file
const LOG_FILE = path.join(__dirname, '..', 'logs', 'logs.txt');

/**
 * Appends a log entry to logs/logs.txt asynchronously.
 * Uses the built-in fs module (Lab 1 requirement).
 *
 * @param {string} level   - Log level: INFO, WARNING, ERROR
 * @param {string} message - The log message
 */
const appendLog = (level, message) => {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;

  // fs.appendFile is async — it won't block the event loop
  fs.appendFile(LOG_FILE, logEntry, (err) => {
    if (err) {
      // If logs directory doesn't exist, create it first
      fs.mkdirSync(path.join(__dirname, '..', 'logs'), { recursive: true });
      fs.appendFile(LOG_FILE, logEntry, () => {}); // retry
    }
  });
};

/**
 * Read recent logs from the log file (async with callback).
 * Demonstrates fs.readFile usage.
 *
 * @param {Function} callback - (err, data) callback
 */
const readLogs = (callback) => {
  fs.readFile(LOG_FILE, 'utf8', (err, data) => {
    if (err) {
      return callback(null, 'No logs found yet.');
    }
    // Return last 50 lines for brevity
    const lines = data.trim().split('\n').slice(-50).join('\n');
    callback(null, lines);
  });
};

/**
 * Clear/reset the log file.
 */
const clearLogs = (callback) => {
  fs.writeFile(LOG_FILE, '', callback);
};

module.exports = { appendLog, readLogs, clearLogs };
