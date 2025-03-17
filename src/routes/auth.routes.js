// routes/auth.routes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth");

// If you want to let superadmin create admin/superadmin:
router.post(
  "/register",
  protect, // ensures req.user is set
  authController.register
);

router.post("/login", authController.login);

module.exports = router;
