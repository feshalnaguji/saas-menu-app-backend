// controllers/excel.controller.js
const excelService = require("../services/excel.service");
const fs = require("fs");
const xlsx = require("xlsx");

exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }
    const { path: filePath, originalname } = req.file;
    const { restaurantId } = req.body;

    // parse the Excel
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(sheet);

    // 1) Count how many item rows are in rawRows
    const itemCount = rawRows.filter((r) => r.type === "item").length;

    // 2) If user is admin, ensure itemCount <= 50
    if (req.user.role === "admin" && itemCount > 50) {
      fs.unlinkSync(filePath); // remove file
      return res.status(403).json({
        success: false,
        message: `Cannot import more than 50 items. Please contact superadmin.`,
      });
    }

    // Convert them to the shape: { type, serviceName, categoryName, name, etc. }
    // If your columns are "type, name, serviceName, description, price, etc." do:
    const rows = rawRows.map((r) => ({
      type: r.type,
      name: r.name,
      serviceName: r.serviceName,
      categoryName: r.categoryName,
      description: r.description || "",
      price: r.price ?? 0,
      vegNonVeg: r.vegNonVeg,
      portionInfo: r.portionInfo,
      calories: r.calories,
      protein: r.protein,
      carbs: r.carbs,
      fat: r.fat,
      allergens: r.allergens,
      ingredients: r.ingredients,
      imageUrl: r.imageUrl,
      available: r.available,
      isSpecial: r.isSpecial,
    }));

    // call the service
    const importResult = await excelService.bulkImport(
      {
        restaurantId,
        rows,
      },
      originalname
    );

    fs.unlinkSync(filePath); // remove file if you want
    return res.json({ success: true, data: importResult });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
