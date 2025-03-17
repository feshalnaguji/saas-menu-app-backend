// src/routes/user.routes.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { protect } = require("../middlewares/auth");

// Additional logic: if you want only superadmin to see all, do authorizeRoles('superadmin')

router.get("/", protect, userController.getAll);

router.get("/:id", protect, userController.getOne);

router.put("/:id", protect, userController.update);

router.delete("/:id", protect, userController.remove);

module.exports = router;
