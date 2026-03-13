/**
 * middleware/logger.js
 * Logs every incoming request with timestamp, method, route & IP.
 */

const fs   = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const logStream = fs.createWriteStream(
  path.join(logsDir, 'requests.log'),
  { flags: 'a' }
);

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method    = req.method.padEnd(6);
  const route     = req.originalUrl;
  const ip        = req.ip || req.connection.remoteAddress;
  const user      = req.session?.user?.username || 'guest';

  const logLine = `[${timestamp}] ${method} ${route}  | IP: ${ip} | User: ${user}`;

  // Console output with colours
  const colour = {
    GET   : '\x1b[32m',   // green
    POST  : '\x1b[34m',   // blue
    PUT   : '\x1b[33m',   // yellow
    DELETE: '\x1b[31m',   // red
    PATCH : '\x1b[35m',   // magenta
  }[req.method] || '\x1b[37m';

  console.log(`${colour}${logLine}\x1b[0m`);

  // Write to file
  logStream.write(logLine + '\n');

  next();
};

module.exports = logger;
