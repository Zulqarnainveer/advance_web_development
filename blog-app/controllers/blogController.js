/**
 * controllers/blogController.js
 * Public-facing blog — list, detail, search, category.
 */

const Post = require('../models/Post');
const POSTS_PER_PAGE = 6;

// Escape special regex characters to prevent ReDoS
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// GET /blog — paginated post listing
exports.getAllPosts = async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const category = req.query.category || '';
    const query    = { status: 'published' };
    if (category) query.category = category;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * POSTS_PER_PAGE)
      .limit(POSTS_PER_PAGE);

    const categories = await Post.distinct('category', { status: 'published' });

    res.render('blog/index', {
      title     : 'Blog',
      posts,
      categories,
      currentCategory: category,
      pagination: {
        page,
        totalPages: Math.ceil(total / POSTS_PER_PAGE),
        total,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};

// GET /blog/search
exports.searchPosts = async (req, res) => {
  try {
    const q = req.query.q || '';
    let posts = [];
    if (q.trim()) {
      const safeQ = escapeRegex(q.trim());
      posts = await Post.find({
        status : 'published',
        $or    : [
          { title  : { $regex: safeQ, $options: 'i' } },
          { content: { $regex: safeQ, $options: 'i' } },
          { tags   : { $in: [new RegExp(safeQ, 'i')] } },
        ],
      }).populate('author', 'username avatar').sort({ createdAt: -1 });
    }
    res.render('blog/search', { title: `Search: "${q}"`, posts, query: q });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};

// GET /blog/:slug — single post detail
exports.getSinglePost = async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { slug: req.params.slug, status: 'published' },
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username avatar bio');

    if (!post) {
      return res.status(404).render('404', { title: 'Post Not Found' });
    }

    // Related posts (same category, exclude current)
    const related = await Post.find({
      category: post.category,
      status  : 'published',
      _id     : { $ne: post._id },
    }).populate('author', 'username avatar').limit(3).sort({ createdAt: -1 });

    res.render('blog/show', { title: post.title, post, related });
  } catch (err) {
    res.status(500).render('500', { title: 'Error', error: err.message });
  }
};
