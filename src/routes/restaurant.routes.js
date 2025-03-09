// src/routes/restaurant.routes.js

const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller");

// Create new restaurant
router.post("/", restaurantController.create);

// Get all active restaurants
router.get("/", restaurantController.getAll);

// Get single restaurant
router.get("/:id", restaurantController.getOne);

// Update restaurant
router.put("/:id", restaurantController.update);

// Deactivate restaurant
router.delete("/:id", restaurantController.deactivate);

module.exports = router;
