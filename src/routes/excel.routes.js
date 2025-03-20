// src/routes/excel.routes.js

const express = require("express");
const router = express.Router();
const excelController = require("../controllers/excel.controller");
const upload = require("../middlewares/fileUpload"); // Multer
const { protect, authorizeRoles } = require("../middlewares/auth");
const {
  checkExcelRestaurantAccess,
} = require("../middlewares/checkExcelRestaurantAccess");

// POST /api/excel/upload (full upload)
router.post(
  "/upload",
  protect,
  authorizeRoles("admin", "superadmin"), // only these roles can upload
  upload.single("file"),
  checkExcelRestaurantAccess, // new or re-use checkRestaurantAccess with a tweak
  excelController.uploadExcel
);

// POST /api/excel/upload-update (Update)
router.post(
  "/upload-update",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("file"),
  checkExcelRestaurantAccess,
  excelController.uploadExcelUpdate // we'll define this
);

module.exports = router;
