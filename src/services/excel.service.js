// src/services/excel.service.js

const { v4: uuidv4 } = require("uuid");
const ImportLog = require("../models/ImportLog");
const Service = require("../models/Service");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

/**
 * Bulk import logic for Services, Categories, and MenuItems
 * after parsing Excel. This is a simple example that
 * expects arrays of objects for each entity.
 *
 * @param {Object} importData - { restaurantId, services[], categories[], items[] }
 * @param {String} fileName - original filename
 * @returns {Object} summary { rowCount, successCount, failCount, importBatchId }
 */
async function bulkImport(importData, fileName) {
  const { restaurantId, services, categories, items } = importData;
  const importBatchId = uuidv4(); // unique ID for this batch

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 1. Insert or update services
    for (const svcRow of services || []) {
      rowCount++;
      try {
        // Add restaurantId and batch
        svcRow.restaurantId = restaurantId;
        svcRow.importBatch = importBatchId;

        // Create new service doc
        const svc = new Service(svcRow);
        await svc.save();
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`Service row error: ${err.message}`);
      }
    }

    // 2. Insert or update categories
    for (const catRow of categories || []) {
      rowCount++;
      try {
        catRow.importBatch = importBatchId;
        // catRow.serviceId must be the _id of the service doc or
        // you might match it by name if you want. This example
        // is simplified, we assume we already have the correct serviceId

        const category = new Category(catRow);
        await category.save();
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`Category row error: ${err.message}`);
      }
    }

    // 3. Insert or update menu items
    for (const itemRow of items || []) {
      rowCount++;
      try {
        itemRow.importBatch = importBatchId;
        // itemRow.categoryId must be correct or found by name if needed
        const menuItem = new MenuItem(itemRow);
        await menuItem.save();
        successCount++;
      } catch (err) {
        failCount++;
        errors.push(`MenuItem row error: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push(`General import error: ${err.message}`);
  }

  // Log the import
  const importLogDoc = new ImportLog({
    fileName,
    rowCount,
    successCount,
    failCount,
    errors,
    importBatchId,
  });
  await importLogDoc.save();

  return {
    rowCount,
    successCount,
    failCount,
    importBatchId,
    errors,
  };
}

module.exports = {
  bulkImport,
};
