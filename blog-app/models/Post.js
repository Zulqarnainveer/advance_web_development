/**
 * models/Post.js — Mongoose Post Schema with slugify & relationships
 */

const mongoose    = require('mongoose');
const slugify     = require('slugify');
const CATEGORIES  = require('../config/categories');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type     : String,
      required : [true, 'Post title is required'],
      trim     : true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    slug: {
      type  : String,
      unique: true,
      index : true,
    },
    content: {
      type     : String,
      required : [true, 'Post content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    excerpt: {
      type     : String,
      maxlength: [300, 'Excerpt cannot exceed 300 characters'],
    },
    coverImage: {
      type   : String,
      default: 'default-cover.jpg',
    },
    category: {
      type    : String,
      required: [true, 'Category is required'],
      enum    : CATEGORIES,
    },
    tags: {
      type   : [String],
      default: [],
    },
    author: {
      type    : mongoose.Schema.Types.ObjectId,
      ref     : 'User',
      required: [true, 'Author is required'],
    },
    status: {
      type   : String,
      enum   : ['draft', 'published'],
      default: 'published',
    },
    views: {
      type   : Number,
      default: 0,
    },
    likes: {
      type   : [mongoose.Schema.Types.ObjectId],
      ref    : 'User',
      default: [],
    },
    readTime: {
      type: Number,  // in minutes
    },
  },
  {
    timestamps: true,
    toJSON    : { virtuals: true },
    toObject  : { virtuals: true },
  }
);

// ── Indexes for performance ───────────────────────────────────
PostSchema.index({ title: 'text', content: 'text', tags: 'text' });
PostSchema.index({ author: 1, createdAt: -1 });
PostSchema.index({ category: 1 });

// ── Virtual: like count ───────────────────────────────────────
PostSchema.virtual('likeCount').get(function () {
  return this.likes ? this.likes.length : 0;
});

// ── Pre-save: generate slug + excerpt + readTime ─────────────
PostSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower      : true,
      strict     : true,
      replacement: '-',
    }) + '-' + Date.now();
  }

  if (this.isModified('content')) {
    // Strip HTML tags for excerpt
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt    = plainText.substring(0, 250) + (plainText.length > 250 ? '...' : '');

    // Estimate read time (avg 200 wpm)
    const wordCount  = plainText.split(/\s+/).length;
    this.readTime    = Math.ceil(wordCount / 200);
  }

  next();
});

// ── Static: Get posts by category ────────────────────────────
PostSchema.statics.getByCategory = function (category) {
  return this.find({ category, status: 'published' })
    .populate('author', 'username avatar')
    .sort({ createdAt: -1 });
};

// ── Static: Search posts ──────────────────────────────────────
PostSchema.statics.search = function (query) {
  return this.find(
    { $text: { $search: query }, status: 'published' },
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' } })
    .populate('author', 'username avatar');
};

module.exports = mongoose.model('Post', PostSchema);
