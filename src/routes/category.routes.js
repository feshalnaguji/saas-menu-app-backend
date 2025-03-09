// src/routes/category.routes.js

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");

// Create new category
router.post("/", categoryController.create);

// Get categories for a specific service
// e.g. GET /api/categories/service/SVC123
router.get("/service/:serviceId", categoryController.getByService);

// Update category
router.put("/:id", categoryController.update);

// Deactivate category
router.delete("/:id", categoryController.deactivate);

module.exports = router;
