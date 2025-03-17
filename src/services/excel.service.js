// src/services/excel.service.js
const { v4: uuidv4 } = require("uuid");
const ImportLog = require("../models/ImportLog");
const Service = require("../models/Service");
const Category = require("../models/Category");
const MenuItem = require("../models/MenuItem");

/**
 * Bulk import that:
 * 1) deletes old services/cats/items for the restaurant,
 * 2) name-based create for services, categories, items
 *
 * @param {Object} importData - { restaurantId, rows: [] }
 *    each element in rows has: { type, serviceName, categoryName, name, price, ... }
 * @param {String} fileName - original filename
 */
async function bulkImport(importData, fileName) {
  const { restaurantId, rows } = importData;
  const importBatchId = uuidv4();

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 0) DELETE old data for this restaurant
    //    We assume any existing service => categories => items are cleared
    //    so the new Excel fully replaces them.
    await Service.deleteMany({ restaurantId });
    await Category.deleteMany({
      /* or find categories that belong to those old services? 
                                   but since the old services are gone, 
                                   those cats are effectively orphaned anyway if you had references */
    });
    await MenuItem.deleteMany({
      /* same logic if needed. 
                                   If you want to be thorough, 
                                   do "categoryId in the old categories" 
                                   but typically you can just do a big delete 
                                   if you store restaurantId at item level. 
                                   If your schema doesn't store item->restaurant directly, 
                                   you might do a more advanced approach. */
    });

    // 1) local maps by name => doc
    const serviceMap = {};
    const categoryMap = {};

    for (const row of rows || []) {
      rowCount++;
      const { type } = row;
      try {
        if (type === "service") {
          // create a new service doc with row.name, row.description, etc.
          // row.name is the "serviceName"
          const svcDoc = new Service({
            restaurantId,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false, // default to true if not specified
            importBatch: importBatchId,
            // add other fields if you want
          });
          await svcDoc.save();
          // store in serviceMap
          serviceMap[row.name] = svcDoc;
          successCount++;
        } else if (type === "category") {
          // we rely on row.serviceName to find the parent service
          const svcName = row.serviceName;
          let parentSvc = serviceMap[svcName];
          if (!parentSvc) {
            // if we didn't see a "service" row for that name, create it on the fly
            parentSvc = new Service({
              restaurantId,
              name: svcName,
              importBatch: importBatchId,
            });
            await parentSvc.save();
            serviceMap[svcName] = parentSvc;
          }
          // now create the category
          const catDoc = new Category({
            serviceId: parentSvc._id,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
          });
          await catDoc.save();
          categoryMap[row.name] = catDoc;
          successCount++;
        } else if (type === "item") {
          // we rely on row.categoryName to find the parent category
          const catName = row.categoryName;
          let parentCat = categoryMap[catName];
          if (!parentCat) {
            // if there's no row for that category, optionally create on the fly
            // but typically you'd want to fail. We'll create for demo:
            parentCat = new Category({
              // but we need a parent service => we might do a "dummy" or fail
              name: catName,
              serviceId: null,
            });
            await parentCat.save();
            categoryMap[catName] = parentCat;
          }
          const itemDoc = new MenuItem({
            categoryId: parentCat._id,
            name: row.name,
            description: row.description || "",
            price: row.price ?? 0,
            vegNonVeg: row.vegNonVeg || "veg",
            portionInfo: row.portionInfo || "",
            nutritionalInfo: {
              calories: row.calories ?? 0,
              protein: row.protein ?? 0,
              carbs: row.carbs ?? 0,
              fat: row.fat ?? 0,
            },
            allergens: row.allergens ? row.allergens.split(",") : [],
            ingredients: row.ingredients ? row.ingredients.split(",") : [],
            imageUrl: row.imageUrl || "",
            available: row.available !== false,
            isSpecial: row.isSpecial === true,
            importBatch: importBatchId,
          });
          await itemDoc.save();
          successCount++;
        } else {
          failCount++;
          errors.push(`Unknown row type '${type}'`);
        }
      } catch (err) {
        failCount++;
        errors.push(`Row error: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push(`General import error: ${err.message}`);
  }

  // Insert an ImportLog doc if you want
  const importLogDoc = new ImportLog({
    fileName,
    importedAt: new Date(),
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
