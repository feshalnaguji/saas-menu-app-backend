// src/routes/category.routes.js

const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");

// Create new category
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.create
);

// Get categories for a specific service
// e.g. GET /api/categories/service/SVC123
router.get("/service/:serviceId", categoryController.getByService);

// Update category
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.update
);

// Deactivate category
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.deactivate
);

// Get all categories (accross all restaurants)
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.getAllGlobal
);

// Delete all categories (accross all restaurants)
router.delete(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.deleteAll
);

// new routes
router.patch(
  "/service/:serviceId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.enableAllByService
);
router.patch(
  "/service/:serviceId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.disableAllByService
);
router.delete(
  "/service/:serviceId",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.deleteAllByService
);

router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.enableOne
);
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  categoryController.disableOne
);

module.exports = router;
