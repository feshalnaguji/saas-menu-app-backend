// src/routes/restaurant.routes.js

const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurant.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");

// Create new restaurant
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.create
);

// Get all active restaurants
router.get("/", restaurantController.getAll);

// Get single restaurant
router.get("/:id", restaurantController.getOne);

// Update restaurant
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.update
);

// Deactivate restaurant
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.deactivate
);

// Get QR code slug for restaurant
router.get("/:id/qr", protect, restaurantController.getQRCode);

// New Routes
router.get(
  "/all/global",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.getAllGlobal
);
router.delete(
  "/all/global",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.deleteAll
);

router.patch(
  "/all/global/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.enableAllGlobal
);
router.patch(
  "/all/global/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.disableAllGlobal
);

router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.enableOne
);
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  restaurantController.disableOne
);

module.exports = router;
