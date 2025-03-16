// src/routes/service.routes.js

const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");

// Create new service
router.post("/", serviceController.create);

// Get services for a specific restaurant
// e.g. GET /api/services/restaurant/ABC123
router.get("/restaurant/:restaurantId", serviceController.getByRestaurant);

// Update service
router.put("/:id", serviceController.update);

// Deactivate service
router.delete("/:id", serviceController.deactivate);

// Get all services (accross all restaurants)
router.get("/", serviceController.getAllGlobal);

// Delete all services (accross all restaurants)
router.delete(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.deleteAll
);

// Disable all services for a specific restaurant
router.patch(
  "/restaurant/:restaurantId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.disableAllByRestaurant
);

// Enable all services for a specific restaurant
router.patch(
  "/restaurant/:restaurantId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.enableAllByRestaurant
);

// Enable one service for a specific restaurant
router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.enableOne
);

// Disable one service for a specific restaurant
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.disableOne
);

// Delete all services for a specific restaurant
router.delete(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.deleteAllByRestaurant
);

module.exports = router;
