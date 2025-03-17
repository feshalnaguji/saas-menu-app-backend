// src/app.js

const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const errorHandler = require("./middlewares/errorHandler");

// Middleware for JSON body parsing
app.use(express.json());

// If you need to serve static files (like from 'uploads/'):
// app.use('/uploads', express.static('uploads'));

// Import your routes
const restaurantRoutes = require("./routes/restaurant.routes");
const serviceRoutes = require("./routes/service.routes");
const categoryRoutes = require("./routes/category.routes");
const menuItemRoutes = require("./routes/menuItem.routes");
const excelRoutes = require("./routes/excel.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Set security HTTP header
app.use(
  cors({
    origin: "*", // Configure this according to your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

app.use(helmet());

app.use(compression());

// Mount routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/excel", excelRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error handling middleware (example)
app.use(errorHandler);

module.exports = app;
