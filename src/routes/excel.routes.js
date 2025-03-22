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

// The new "merge" approach that also disables old docs not in the Excel:
// POST /api/excel/upload-merge
router.post(
  "/upload-merge",
  protect,
  authorizeRoles("admin", "superadmin"),
  upload.single("file"),
  checkExcelRestaurantAccess,
  excelController.uploadExcelMerge // We'll define a new controller method
);

module.exports = router;
