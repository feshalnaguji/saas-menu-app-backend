// src/routes/menuItem.routes.js

const express = require("express");
const router = express.Router();
const menuItemController = require("../controllers/menuItem.controller");
const { protect, authorizeRoles } = require("../middlewares/auth");
const { checkMenuItemAccess } = require("../middlewares/checkMenuItemAccess");

// CREATE new menu item
router.post(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  // might do a custom check that the category belongs to the admin's restaurant
  menuItemController.create
);

// GET items by category
router.get(
  "/category/:categoryId",
  protect,
  // you might or might not require admin for read
  menuItemController.getByCategory
);

// UPDATE single item
router.put(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.update
);

// DISABLE (soft delete) single item
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.disable
);

// GET all items (global)
router.get(
  "/",
  protect,
  authorizeRoles("admin", "superadmin"),
  menuItemController.getAllGlobal
);

// DELETE all items (global)
router.delete(
  "/",
  protect,
  authorizeRoles("superadmin"),
  menuItemController.deleteAllGlobal
);

// ENABLE single item
router.patch(
  "/:id/enable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.enableOne
);

// DISABLE single item
router.patch(
  "/:id/disable",
  protect,
  authorizeRoles("admin", "superadmin"),
  checkMenuItemAccess,
  menuItemController.disableOne
);

// ENABLE all items by category
router.patch(
  "/category/:categoryId/enableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  // might do checkCategoryAccess
  menuItemController.enableAllByCategory
);

// DISABLE all items by category
router.patch(
  "/category/:categoryId/disableAll",
  protect,
  authorizeRoles("admin", "superadmin"),
  // might do checkCategoryAccess
  menuItemController.disableAllByCategory
);

// DELETE all items by category
router.delete(
  "/category/:categoryId",
  protect,
  authorizeRoles("admin", "superadmin"),
  // might do checkCategoryAccess
  menuItemController.deleteAllByCategory
);

module.exports = router;
