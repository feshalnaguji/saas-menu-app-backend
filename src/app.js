// src/app.js

const express = require("express");
const app = express();
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

// Mount routes
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/excel", excelRoutes);

// Error handling middleware (example)
app.use(errorHandler);

module.exports = app;
