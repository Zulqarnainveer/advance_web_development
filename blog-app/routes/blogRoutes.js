/**
 * routes/blogRoutes.js
 */
const express = require('express');
const router  = express.Router();
const blogController = require('../controllers/blogController');

router.get('/',         blogController.getAllPosts);
router.get('/search',   blogController.searchPosts);
router.get('/:slug',    blogController.getSinglePost);

module.exports = router;
