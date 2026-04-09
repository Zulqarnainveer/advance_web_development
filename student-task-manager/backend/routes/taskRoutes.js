// ============================================================
// routes/taskRoutes.js
// RESTful API routes for Tasks (Full CRUD + Search + Filter)
// LAB 6: CRUD operations, populate() for relationships
// Extra Feature: Search & Filtering (bonus marks)
// ============================================================

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { protect } = require('../middleware/authMiddleware');
const { appendLog } = require('../modules/fileLogger');

// All task routes are protected — user must be logged in
router.use(protect);

// ============================================================
// @route   GET /api/tasks
// @desc    Get all tasks for logged-in user (with search & filter)
// @access  Private
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    // --- BUILD QUERY OBJECT (Extra Feature: Filtering) ---
    const queryObj = { assignedTo: req.user._id };

    // Filter by status
    if (req.query.status && req.query.status !== 'all') {
      queryObj.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority && req.query.priority !== 'all') {
      queryObj.priority = req.query.priority;
    }

    // Search by title or description (Extra Feature: Search)
    if (req.query.search) {
      queryObj.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
        { subject: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Sorting (default: newest first)
    const sortBy = req.query.sortBy || '-createdAt';

    // Execute query with populate() to get user data
    // LAB 6: populate() fills in the assignedTo field with actual User data
    const tasks = await Task.find(queryObj)
      .populate('assignedTo', 'name email') // populate() — Lab 6
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments(queryObj);

    res.status(200).json({
      success: true,
      count: tasks.length,
      total: totalTasks,
      page,
      totalPages: Math.ceil(totalTasks / limit),
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   GET /api/tasks/stats
// @desc    Get task statistics (counts by status/priority)
// @access  Private
// ============================================================
router.get('/stats', async (req, res, next) => {
  try {
    const userId = req.user._id;

    // MongoDB Aggregation Pipeline for stats
    const stats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const priorityStats = await Task.aggregate([
      { $match: { assignedTo: userId } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);

    const total = await Task.countDocuments({ assignedTo: userId });
    const overdue = await Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    });

    res.status(200).json({
      success: true,
      data: {
        total,
        overdue,
        byStatus: stats,
        byPriority: priorityStats,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   GET /api/tasks/:id
// @desc    Get a single task by ID
// @access  Private
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user._id, // Ensure ownership
    }).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to view it.',
      });
    }

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private
// ============================================================
router.post('/', async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, subject, tags } = req.body;

    // Assign task to the currently logged-in user
    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      subject,
      tags,
      assignedTo: req.user._id, // Link to User (Lab 6: relationship)
    });

    // Populate user info before returning
    await task.populate('assignedTo', 'name email');

    appendLog('INFO', `Task created: "${title}" by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Task created successfully!',
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   PUT /api/tasks/:id
// @desc    Update an existing task
// @access  Private
// ============================================================
router.put('/:id', async (req, res, next) => {
  try {
    // Ensure the task belongs to the logged-in user before updating
    const task = await Task.findOne({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to edit it.',
      });
    }

    const { title, description, status, priority, dueDate, subject, tags } = req.body;

    // Update fields
    task.title = title || task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.dueDate = dueDate || task.dueDate;
    task.subject = subject || task.subject;
    task.tags = tags || task.tags;

    // pre-save hook will handle isCompleted and completedAt
    await task.save({ runValidators: true });
    await task.populate('assignedTo', 'name email');

    appendLog('INFO', `Task updated: "${task.title}" by user ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Task updated successfully!',
      data: task,
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   PATCH /api/tasks/:id/status
// @desc    Quick update — change only the status of a task
// @access  Private
// ============================================================
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'in-progress', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, assignedTo: req.user._id },
      { status, isCompleted: status === 'completed', completedAt: status === 'completed' ? new Date() : null },
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    res.status(200).json({ success: true, message: 'Status updated.', data: task });
  } catch (error) {
    next(error);
  }
});

// ============================================================
// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private
// ============================================================
router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      assignedTo: req.user._id,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or you do not have permission to delete it.',
      });
    }

    appendLog('INFO', `Task deleted: "${task.title}" by user ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: `Task "${task.title}" deleted successfully.`,
      data: {},
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
