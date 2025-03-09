// src/controllers/excel.controller.js
//
// This controller depends on the file upload middleware (fileUpload.js)
// for handling the actual file. Then we parse with e.g. xlsx or sheetjs
// in the excel.service or here. This example shows how to pass
// the parsed data to excel.service.bulkImport.

const path = require("path");
const fs = require("fs");
const xlsx = require("xlsx");
const excelService = require("../services/excel.service");

/**
 * Upload Excel file and parse it.
 * Then call excelService.bulkImport(...) with the parsed data.
 * We'll store the file in 'uploads' folder, parse it,
 * then optionally remove it or keep it for logs.
 */
async function uploadExcel(req, res, next) {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const { path: filePath, originalname } = req.file;

    // 1. Parse the Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    // (We assume your Excel data has columns like "type" = "service"/"category"/"item", etc.
    // or you have separate sheets for each. This is an example approach.)

    // For demonstration, let's say we separate rows by a "type" column
    // to build arrays for services, categories, items:

    const services = [];
    const categories = [];
    const items = [];

    const restaurantId = req.body.restaurantId; // or from query param?

    jsonData.forEach((row) => {
      // If row.type === 'service', push to services array, etc.
      if (row.type === "service") {
        services.push({
          restaurantId,
          name: row.name,
          description: row.description || "",
          importBatch: "",
        });
      } else if (row.type === "category") {
        categories.push({
          serviceId: row.serviceId, // or match by name if needed
          name: row.name,
          description: row.description || "",
          importBatch: "",
        });
      } else if (row.type === "item") {
        items.push({
          categoryId: row.categoryId, // or match by name if needed
          name: row.name,
          description: row.description || "",
          price: row.price || 0,
          vegNonVeg: row.vegNonVeg || "veg",
          portionInfo: row.portionInfo || "",
          // etc.
          importBatch: "",
        });
      }
    });

    // 2. Call excelService.bulkImport
    const importResult = await excelService.bulkImport(
      {
        restaurantId,
        services,
        categories,
        items,
      },
      originalname
    );

    // 3. Optionally remove the file from 'uploads' after parsing
    fs.unlinkSync(filePath);

    return res.json({
      success: true,
      message: "File imported successfully",
      data: importResult,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadExcel,
};
