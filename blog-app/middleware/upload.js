/**
 * middleware/upload.js
 * Validates uploaded image files — type, size, and presence.
 */

const path = require('path');
const fs   = require('fs');

const ALLOWED_TYPES = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const MAX_SIZE_MB   = 5;
const MAX_SIZE_B    = MAX_SIZE_MB * 1024 * 1024;
const UPLOAD_DIR    = path.join(__dirname, '..', 'public', 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

/**
 * Validates image upload (optional — skip if no file uploaded)
 */
const validateImage = (req, res, next) => {
  // If no file is uploaded, skip validation (image is optional on edit)
  if (!req.files || !req.files.image) return next();

  const file = req.files.image;
  const ext  = path.extname(file.name).toLowerCase();

  // Check file type
  if (!ALLOWED_TYPES.includes(ext)) {
    req.flash('error_msg', `❌ Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    return res.redirect('back');
  }

  // Check file size
  if (file.size > MAX_SIZE_B) {
    req.flash('error_msg', `❌ File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
    return res.redirect('back');
  }

  // Sanitise filename — prevent directory traversal
  const safeName = Date.now() + '-' + file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
  req.uploadedFileName = safeName;

  next();
};

/**
 * Requires an image to be uploaded (used on post creation)
 */
const requireImage = (req, res, next) => {
  if (!req.files || !req.files.image) {
    req.flash('error_msg', '❌ A cover image is required for new posts.');
    return res.redirect('back');
  }
  next();
};

/**
 * Moves the temp file to the uploads directory
 */
const moveUploadedFile = async (req, res, next) => {
  if (!req.files || !req.files.image || !req.uploadedFileName) return next();

  const uploadPath = path.join(UPLOAD_DIR, req.uploadedFileName);
  try {
    await req.files.image.mv(uploadPath);
    next();
  } catch (err) {
    console.error('Upload error:', err);
    req.flash('error_msg', '❌ Failed to save uploaded file. Please try again.');
    res.redirect('back');
  }
};

module.exports = { validateImage, requireImage, moveUploadedFile };
