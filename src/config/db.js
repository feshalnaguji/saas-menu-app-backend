// src/config/db.js

const mongoose = require("mongoose");
const { mongoUri, env } = require("./index");

// Additional Mongoose options (optional)
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // If you need more advanced options, add them here
};

async function connectDB() {
  try {
    await mongoose.connect(mongoUri, mongooseOptions);
    console.log(`[DB] Connected to MongoDB in ${env} mode: ${mongoUri}`);
  } catch (error) {
    console.error("[DB] Error connecting to MongoDB:", error);
    process.exit(1); // Exit if DB connection fails
  }
}

module.exports = connectDB;
