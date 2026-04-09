// ============================================================
// modules/dbConnect.js
// Custom module for MongoDB connection using Mongoose
// LAB 6 Concept: Database connection setup
// ============================================================

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the URI from environment variables.
 * This is a reusable custom module that encapsulates DB logic.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Mongoose 8.x does not need useNewUrlParser, useUnifiedTopology
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure if DB connection fails
    process.exit(1);
  }
};

// Handle mongoose disconnection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

module.exports = connectDB;
