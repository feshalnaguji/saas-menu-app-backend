// src/server.js

// const app = require("./index");
const connectDB = require("./config/db");
// const { port } = require("./config/config");

// Connect to MongoDB first
connectDB()
  .then(() => {
    // Start the server only if DB connection is successful
    // app.listen(port, () => {
    //   console.log(`[Server] App listening on port ${port}`);
    // });
    console.log("Server is running");
  })
  .catch((err) => {
    console.error("[Server] Error connecting to DB:", err);
    process.exit(1);
  });
