// src/server.js

const app = require("./app");
const connectDB = require("./config/db");
const { port } = require("./config/index");

// Connect to MongoDB first
connectDB()
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("[Server] Error connecting to DB:", err);
    process.exit(1);
  });

// For Vercel, we need to export the app
if (process.env.VERCEL) {
  // Export for serverless
  module.exports = app;
} else {
  // Start server normally
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}
