// ============================================================
// models/Task.js
// Mongoose Task Schema & Model
// LAB 6 Concept: Schema with validations, relationships via ref
// ============================================================

const mongoose = require('mongoose');

/**
 * Task Schema
 * Each task belongs to a User — relationship defined via 'ref'.
 * Lab 6: Relationships using references + populate()
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    status: {
      type: String,
      enum: {
        values: ['pending', 'in-progress', 'completed'],
        message: 'Status must be pending, in-progress, or completed',
      },
      default: 'pending',
    },

    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },

    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      validate: {
        validator: function (value) {
          // Due date must be in the future (only on creation)
          return this.isNew ? value >= new Date() : true;
        },
        message: 'Due date must be today or in the future',
      },
    },

    subject: {
      type: String,
      trim: true,
      maxlength: [60, 'Subject cannot exceed 60 characters'],
      default: 'General',
    },

    tags: {
      type: [String],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'Cannot have more than 5 tags per task',
      },
    },

    isCompleted: {
      type: Boolean,
      default: false,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // ---- RELATIONSHIP: Task belongs to a User ----
    // LAB 6: ref creates a relationship between Task and User collections
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',         // Reference to the User model
      required: [true, 'Task must be assigned to a user'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// ---- VIRTUAL: Days remaining until due date ----
taskSchema.virtual('daysRemaining').get(function () {
  const now = new Date();
  const due = new Date(this.dueDate);
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
  return diff;
});

// ---- PRE-SAVE HOOK: Auto-set completedAt when status changes ----
taskSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'completed') {
    this.isCompleted = true;
    this.completedAt = new Date();
  } else if (this.isModified('status') && this.status !== 'completed') {
    this.isCompleted = false;
    this.completedAt = null;
  }
  next();
});

// ---- INDEX: For faster search queries ----
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ title: 'text', description: 'text' }); // Text search

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
