/**
 * models/User.js — Mongoose User Schema with bcrypt
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type     : String,
      required : [true, 'Username is required'],
      unique   : true,
      trim     : true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username cannot exceed 20 characters'],
      match    : [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, underscores'],
    },
    email: {
      type     : String,
      required : [true, 'Email is required'],
      unique   : true,
      trim     : true,
      lowercase: true,
      match    : [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type     : String,
      required : [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select   : false,   // Never return password by default
    },
    avatar: {
      type   : String,
      default: 'default-avatar.png',
    },
    bio: {
      type     : String,
      maxlength: [300, 'Bio cannot exceed 300 characters'],
      default  : '',
    },
    role: {
      type   : String,
      enum   : ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,                  // createdAt, updatedAt
    toJSON    : { virtuals: true },
    toObject  : { virtuals: true },
  }
);

// ── Virtual: posts written by this user ──────────────────────
UserSchema.virtual('posts', {
  ref         : 'Post',
  localField  : '_id',
  foreignField: 'author',
});

// ── Pre-save: hash password ──────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt    = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Method: compare password ────────────────────────
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ── Instance Method: safe user object (no password) ──────────
UserSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', UserSchema);
