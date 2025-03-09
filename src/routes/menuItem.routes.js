// src/routes/menuItem.routes.js

const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItem.controller");

// Create new menu item
router.post("/", menuItemController.create);

// Get items for a specific category
// e.g. GET /api/menu-items/category/CAT123
router.get("/category/:categoryId", menuItemController.getByCategory);

// Update menu item
router.put("/:id", menuItemController.update);

// Disable/unavailable menu item
router.delete("/:id", menuItemController.disable);

module.exports = router;
