// src/routes/service.routes.js

const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/service.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");
const { checkServiceAccess } = require("../middlewares/checkServiceAccess");

// CREATE new service
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  // You might also confirm the admin is assigned to restaurantId in req.body,
  // but that typically requires a special middleware referencing the body => checkExcelRestaurantAccess logic if you want
  serviceController.create
);

// GET services for a specific restaurant
router.get(
  "/restaurant/:restaurantId",
  protect,
  serviceController.getByRestaurant
);

// UPDATE single service
router.put(
  "/:serviceId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess, // ensures admin can only update a service if it's assigned to their restaurant
  serviceController.update
);

// DEACTIVATE single service
router.delete(
  "/:serviceId",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.deactivate
);

// GET all services globally
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  serviceController.getAllGlobal
);

// DELETE all services globally
router.delete(
  "/",
  protect,
  authorizeRoles("superadmin"),
  serviceController.deleteAll
);

// DISABLE all services for a specific restaurant
router.patch(
  "/restaurant/:restaurantId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  // You might do checkRestaurantAccess logic here if you want admin to only do this if assigned
  serviceController.disableAllByRestaurant
);

// ENABLE all services for a specific restaurant
router.patch(
  "/restaurant/:restaurantId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  // same logic if you want to ensure the admin can do it
  serviceController.enableAllByRestaurant
);

// ENABLE single service for a specific restaurant
router.patch(
  "/:serviceId/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.enableOne
);

// DISABLE one service for a specific restaurant
router.patch(
  "/:serviceId/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkServiceAccess,
  serviceController.disableOne
);

// DELETE all services for a specific restaurant
router.delete(
  "/restaurant/:restaurantId",
  protect,
  authorizeRoles("admin", "superadmin"),
  // checkRestaurantAccess or a variant if you want to confirm
  serviceController.deleteAllByRestaurant
);

module.exports = router;
