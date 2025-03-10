// src/services/excel.service.js (Updated snippet)

const { v4: uuidv4 } = require("uuid");
const ImportLog = require("../models/ImportLog");
const Service = require("../models/Service");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");
const mongoose = require("mongoose");

/**
 * Updated bulk import that supports EITHER:
 * - serviceId / categoryId
 * - OR serviceName / categoryName
 */
async function bulkImport(importData, fileName) {
  const { restaurantId, services, categories, items } = importData;
  const importBatchId = uuidv4();

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  // local caches: name -> ObjectId
  const serviceMap = {};
  const categoryMap = {};

  // 1) Process services rows
  for (const svcRow of services || []) {
    rowCount++;
    try {
      svcRow.importBatch = importBatchId;

      // either we use the provided restaurantId or name-based approach
      if (!svcRow.restaurantId) {
        svcRow.restaurantId = restaurantId;
      }

      // create or upsert the service if you want. For now, let's just create new:
      // If you want a name-based findOne, see below:
      // e.g. if row.serviceName is given, we can do findOne by { name: row.serviceName, restaurantId }

      // OPTIONAL approach: if row has "name" that is unique
      // check if we already created a service with that name
      if (!svcRow._id) {
        // if we've cached the name, re-use it
        if (serviceMap[svcRow.name]) {
          // already created
          successCount++;
          continue; // skip creation
        } else {
          // create new
          const createdService = await Service.create(svcRow);
          serviceMap[svcRow.name] = createdService._id;
          successCount++;
        }
      }
    } catch (err) {
      failCount++;
      errors.push(`Service row error: ${err.message}`);
    }
  }

  // 2) Process categories
  for (const catRow of categories || []) {
    rowCount++;
    catRow.importBatch = importBatchId;

    try {
      let finalServiceId = null;

      // 2A) if catRow.serviceId is present & valid, use that
      if (catRow.serviceId) {
        // attempt cast to ObjectId
        try {
          finalServiceId = new mongoose.Types.ObjectId(catRow.serviceId);
        } catch (err) {
          // cast fail -> fallback
          finalServiceId = null;
        }
      }

      // 2B) if no valid finalServiceId, attempt name-based approach
      if (!finalServiceId && catRow.serviceName) {
        // look up in local map first
        if (serviceMap[catRow.serviceName]) {
          finalServiceId = serviceMap[catRow.serviceName];
        } else {
          // or find in DB
          let existingService = await Service.findOne({
            name: catRow.serviceName,
            restaurantId,
          });
          if (!existingService) {
            // create new
            existingService = await Service.create({
              restaurantId,
              name: catRow.serviceName,
              importBatch: importBatchId,
            });
          }
          finalServiceId = existingService._id;
          // update local map
          serviceMap[catRow.serviceName] = existingService._id;
        }
      }

      // fallback: if STILL no finalServiceId, fail
      if (!finalServiceId) {
        throw new Error(
          `No valid serviceId or serviceName for category row: ${catRow.name}`
        );
      }

      catRow.serviceId = finalServiceId;
      const categoryName = catRow.name;

      // check if we already created a category with that name + finalServiceId in local map
      const catKey = `${finalServiceId}-${categoryName}`;
      if (categoryMap[catKey]) {
        // skip creation
        successCount++;
      } else {
        // create
        const createdCat = await Category.create(catRow);
        categoryMap[catKey] = createdCat._id;
        successCount++;
      }
    } catch (err) {
      failCount++;
      errors.push(`Category row error: ${err.message}`);
    }
  }

  // 3) Process items
  for (const itemRow of items || []) {
    rowCount++;
    itemRow.importBatch = importBatchId;

    try {
      let finalCategoryId = null;

      // 3A) if itemRow.categoryId is present & valid, use that
      if (itemRow.categoryId) {
        try {
          finalCategoryId = new mongoose.Types.ObjectId(itemRow.categoryId);
        } catch (err) {
          finalCategoryId = null;
        }
      }

      // 3B) if no valid finalCategoryId, attempt name-based approach
      if (!finalCategoryId && itemRow.categoryName) {
        // We need to find the category by name. But we also need the service name or ID
        // Possibly your row has 'serviceName' or 'serviceId'? We'll assume we do 'catKey' approach
        const catKey = `${itemRow.serviceName || "???"}-${
          itemRow.categoryName
        }`;
        // If we stored in categoryMap we can find it
        if (categoryMap[catKey]) {
          finalCategoryId = categoryMap[catKey];
        } else {
          // Or find in DB. But we need a service reference or something. This is demo logic
          // We might guess 'serviceName' is on the row. For now, we'll do a naive find:
          const foundCat = await Category.findOne({
            name: itemRow.categoryName,
          });
          if (!foundCat) {
            // create new category? We need a service though. We'll skip that here or handle gracefully
            throw new Error(
              `No category found or created for itemRow: ${itemRow.name} - missing categoryName + service reference?`
            );
          }
          finalCategoryId = foundCat._id;
          categoryMap[catKey] = foundCat._id;
        }
      }

      if (!finalCategoryId) {
        throw new Error(
          `No valid categoryId or categoryName for item row: ${itemRow.name}`
        );
      }

      itemRow.categoryId = finalCategoryId;
      await MenuItem.create(itemRow);
      successCount++;
    } catch (err) {
      failCount++;
      errors.push(`MenuItem row error: ${err.message}`);
    }
  }

  // finalize ImportLog
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
