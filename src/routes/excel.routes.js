// src/routes/excel.routes.js

const express = require("express");
const router = express.Router();
const excelController = require("../controllers/excel.controller");
const upload = require("../middlewares/fileUpload");

// Upload an Excel file for bulk import
router.post("/upload", upload.single("file"), excelController.uploadExcel);

module.exports = router;
