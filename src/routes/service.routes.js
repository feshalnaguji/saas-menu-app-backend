// src/routes/service.routes.js

const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");

// Create new service
router.post("/", serviceController.create);

// Get services for a specific restaurant
// e.g. GET /api/services/restaurant/ABC123
router.get("/restaurant/:restaurantId", serviceController.getByRestaurant);

// Update service
router.put("/:id", serviceController.update);

// Deactivate service
router.delete("/:id", serviceController.deactivate);

module.exports = router;
