// ============================================================
// app.js — Main Express Application Entry Point
// Structured using Express Generator conventions
// LAB 1, 2, 7: Express setup, middleware, routing
// ============================================================

const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// --- Import Custom Modules (LAB 1: Modular Programming) ---
const connectDB = require('./modules/dbConnect');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// --- Import Routes ---
const indexRouter = require('./routes/index');
const taskRouter = require('./routes/taskRoutes');
const userRouter = require('./routes/userRoutes');

// ---- Initialize Express App ----
const app = express();

// ---- Connect to MongoDB (LAB 6) ----
connectDB();

// ============================================================
// MIDDLEWARE STACK (LAB 2 & 7: Middleware implementation)
// Express processes middleware top-to-bottom for every request
// ============================================================

// 1. CORS — Allow React frontend (port 5173) to communicate with this API
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 2. Morgan — Third-party HTTP request logger (shows in terminal)
app.use(morgan('dev'));

// 3. Custom Request Logger — Logs to logs.txt using fs module (LAB 1)
app.use(requestLogger);

// 4. Body Parsers — Parse incoming JSON and URL-encoded form data
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

// 5. Static Files — Serve CSS, JS, images from /public
app.use(express.static(path.join(__dirname, 'public')));

// ---- EJS View Engine Setup (Express Generator requirement) ----
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ============================================================
// ROUTES
// ============================================================

// EJS-rendered pages (server-side rendering)
app.use('/', indexRouter);

// RESTful API routes (JSON responses for React frontend)
app.use('/api/tasks', taskRouter);
app.use('/api/users', userRouter);

// ---- API Health Check Route ----
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ Student Task Manager API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ---- 404 Handler — Catch undefined routes ----
app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// ---- Global Error Handler (MUST be last) ----
// LAB 7: Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
