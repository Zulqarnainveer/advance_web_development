// ============================================================
// routes/index.js
// EJS-rendered page routes (Express Generator structure)
// LAB: Express Generator & EJS — server-side rendered views
// ============================================================

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { readLogs } = require('../modules/fileLogger');

// ============================================================
// @route   GET /
// @desc    Render EJS home/landing page
// @access  Public
// ============================================================
router.get('/', (req, res) => {
  res.render('index', {
    title: 'Student Task Manager',
    description: 'Manage your assignments, deadlines, and academic tasks efficiently.',
  });
});

// ============================================================
// @route   GET /dashboard
// @desc    EJS-rendered dashboard (server-side stats)
// @access  Public (auth handled client-side in React)
// ============================================================
router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    title: 'Dashboard — Student Task Manager',
  });
});

// ============================================================
// @route   GET /logs
// @desc    View application logs (admin view, EJS rendered)
// @access  Public for demonstration
// ============================================================
router.get('/logs', (req, res) => {
  readLogs((err, logData) => {
    res.render('logs', {
      title: 'Application Logs',
      logs: logData,
    });
  });
});

module.exports = router;
