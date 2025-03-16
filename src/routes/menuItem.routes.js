// src/routes/menuItem.routes.js

const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItem.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");

// Create new menu item
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.create
);

// Get items for a specific category
// e.g. GET /api/menu-items/category/CAT123
router.get("/category/:categoryId", menuItemController.getByCategory);

// Update menu item
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.update
);

// Disable/unavailable menu item
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.disable
);

// new routes
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.getAllGlobal
);
router.delete(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.deleteAllGlobal
);

router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.enableOne
);
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.disableOne
);

router.patch(
  "/category/:categoryId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.enableAllByCategory
);
router.patch(
  "/category/:categoryId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.disableAllByCategory
);

router.delete(
  "/category/:categoryId",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.deleteAllByCategory
);

module.exports = router;
