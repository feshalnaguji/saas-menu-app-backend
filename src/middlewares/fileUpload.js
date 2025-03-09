// src/middlewares/fileUpload.js
//
// This example uses Multer to handle single-file uploads.
// In Phase 1A, we only need it for Excel files, but
// you can expand for images, etc., in future phases.

const multer = require("multer");
const path = require("path");

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Store uploaded files in a 'uploads' folder
    // (Make sure to create this folder or handle if it doesn't exist)
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Use original name or create a custom name
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now();
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

// Basic file filter for Excel (xlsx or xls)
function excelFileFilter(req, file, cb) {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files are allowed"), false);
  }
}

const upload = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit (example)
  },
});

module.exports = upload;
