// src/services/excel.service.js
const { v4: uuidv4 } = require("uuid");
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
    // STEP A) Find old services for this restaurant
    const oldServices = await Service.find({ restaurantId }).select("_id");
    const oldServiceIds = oldServices.map((doc) => doc._id);

    // STEP B) Find categories that belong to these service IDs
    const oldCategories = await Category.find({
      serviceId: { $in: oldServiceIds },
    }).select("_id");
    const oldCategoryIds = oldCategories.map((doc) => doc._id);

    // deactivate them
    await Service.updateMany(
      { _id: { $in: oldServiceIds } },
      { $set: { isActive: false } }
    );
    await Category.updateMany(
      { _id: { $in: oldCategoryIds } },
      { $set: { isActive: false } }
    );
    await MenuItem.updateMany(
      { categoryId: { $in: oldCategoryIds } },
      { $set: { isActive: false } }
    );

    // Now you can re-create new ones from Excel
    const serviceMap = {};
    const categoryMap = {};

    for (let i = 0; i < rows.length; i++) {
      rowCount++;
      const row = rows[i];
      const { type } = row;
      const lineIndex = i + 1; // 1-based or 0-based, your choice
      try {
        if (type === "service") {
          const svcDoc = new Service({
            restaurantId,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
            importLine: lineIndex, // store the position
            importType: "service",
          });
          await svcDoc.save();
          serviceMap[row.name] = svcDoc;
          successCount++;
        } else if (type === "category") {
          const svcName = row.serviceName;
          let parentSvc = serviceMap[svcName];
          if (!parentSvc) {
            // Create service on the fly if missing or fail
            parentSvc = new Service({
              restaurantId,
              name: svcName,
              importBatch: importBatchId,
              importLine: lineIndex, // store the position
              importType: "service",
            });
            await parentSvc.save();
            serviceMap[svcName] = parentSvc;
          }
          const catDoc = new Category({
            serviceId: parentSvc._id,
            name: row.name,
            description: row.description || "",
            isActive: row.isActive !== false,
            importBatch: importBatchId,
            importLine: lineIndex,
            importType: "category",
          });
          await catDoc.save();
          categoryMap[row.name] = catDoc;
          successCount++;
        } else if (type === "item") {
          const catName = row.categoryName;
          let parentCat = categoryMap[catName];
          if (!parentCat) {
            // create cat on the fly or fail
            parentCat = new Category({
              serviceId: null, // no reference => might want to fail instead
              name: catName,
              importLine: lineIndex,
              importType: "category",
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
            importLine: lineIndex,
            importType: "item",
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

  return {
    rowCount,
    successCount,
    failCount,
    importBatchId,
    errors,
  };
}

async function bulkMergeUpdate(importData, fileName) {
  const { restaurantId, rows } = importData;
  const importBatchId = uuidv4();

  let rowCount = 0;
  let successCount = 0;
  let failCount = 0;
  const errors = [];

  try {
    // 1) Load all existing docs for this restaurant
    const existingServices = await Service.find({ restaurantId });
    const existingCats = await Category.find({
      serviceId: { $in: existingServices.map((s) => s._id) },
    });
    const existingItems = await MenuItem.find({
      categoryId: { $in: existingCats.map((c) => c._id) },
    });

    // Build a docMap => key = `${importType}-${importLine}`
    // Then we keep an unusedDocs set of doc IDs for disabling if not used
    const docMap = new Map();
    const unusedDocs = new Set();

    // put all services in docMap
    for (const svc of existingServices) {
      if (svc.importType && svc.importLine != null) {
        const key = `${svc.importType}-${svc.importLine}`;
        docMap.set(key, { doc: svc, docType: "service" });
      }
      unusedDocs.add(svc._id.toString());
    }
    // categories
    for (const cat of existingCats) {
      if (cat.importType && cat.importLine != null) {
        const key = `${cat.importType}-${cat.importLine}`;
        docMap.set(key, { doc: cat, docType: "category" });
      }
      unusedDocs.add(cat._id.toString());
    }
    // items
    for (const it of existingItems) {
      if (it.importType && it.importLine != null) {
        const key = `${it.importType}-${it.importLine}`;
        docMap.set(key, { doc: it, docType: "item" });
      }
      unusedDocs.add(it._id.toString());
    }

    // 2) For each new row
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      rowCount++;
      const lineIndex = i + 1; // 1-based
      const key = `${row.type}-${lineIndex}`;

      try {
        // check if we have an existing doc for that type+line
        const foundEntry = docMap.get(key);
        if (foundEntry) {
          // the doc was previously created on this row
          const oldDoc = foundEntry.doc;
          // if name changed => disable old doc + create new doc
          if (row.name !== oldDoc.name) {
            oldDoc.isActive = false;
            await oldDoc.save();
            // create brand-new doc with new name
            await createNewDoc(
              row,
              lineIndex,
              importBatchId,
              restaurantId,
              errors
            );
          } else {
            // same name => just update subfields
            await updateDocFields(oldDoc, row, errors);
            // doc is used => remove from unused
            unusedDocs.delete(oldDoc._id.toString());
          }
          successCount++;
        } else {
          // brand-new row => create new doc with parentName-based approach
          await createNewDoc(
            row,
            lineIndex,
            importBatchId,
            restaurantId,
            errors
          );
          successCount++;
        }
      } catch (err) {
        failCount++;
        errors.push(`Row error (line ${lineIndex}): ${err.message}`);
      }
    }

    // 3) disable any docs leftover in unusedDocs
    for (const docId of unusedDocs) {
      let updated = await Service.findByIdAndUpdate(docId, { isActive: false });
      if (!updated) {
        updated = await Category.findByIdAndUpdate(docId, { isActive: false });
      }
      if (!updated) {
        updated = await MenuItem.findByIdAndUpdate(docId, { isActive: false });
      }
    }
  } catch (err) {
    errors.push(`General import error: ${err.message}`);
  }

  return {
    rowCount,
    successCount,
    failCount,
    errors,
    importBatchId,
  };
}

// Helper: create doc for a brand-new row
async function createNewDoc(
  row,
  lineIndex,
  importBatchId,
  restaurantId,
  errors
) {
  if (row.type === "service") {
    const svc = new Service({
      restaurantId,
      name: row.name,
      description: row.description || "",
      isActive: row.isActive !== false,
      importBatch: importBatchId,
      importType: "service",
      importLine: lineIndex,
    });
    await svc.save();
  } else if (row.type === "category") {
    // we must find or create parent service by name => row.serviceName
    if (!row.serviceName) {
      throw new Error(`Category row missing serviceName => ${row.name}`);
    }
    let parentSvc = await Service.findOne({
      restaurantId,
      name: row.serviceName,
    });
    if (!parentSvc) {
      // create parent service
      parentSvc = new Service({
        restaurantId,
        name: row.serviceName,
        importBatch: importBatchId,
        importType: "service",
        importLine: null, // we can't position-based a new parent if the user didn't specify
      });
      await parentSvc.save();
    }
    const cat = new Category({
      serviceId: parentSvc._id,
      name: row.name,
      description: row.description || "",
      isActive: row.isActive !== false,
      importBatch: importBatchId,
      importType: "category",
      importLine: lineIndex,
    });
    await cat.save();
  } else if (row.type === "item") {
    // find or create parent category by name => row.categoryName
    if (!row.categoryName) {
      throw new Error(`Item row missing categoryName => ${row.name}`);
    }
    let catDoc = await Category.findOne({ name: row.categoryName }).populate(
      "serviceId"
    );
    if (!catDoc) {
      // create new cat
      catDoc = new Category({
        name: row.categoryName,
        importBatch: importBatchId,
        importType: "category",
        importLine: null, // new category row
      });
      await catDoc.save();
    }

    const itemDoc = new MenuItem({
      categoryId: catDoc._id,
      name: row.name,
      isActive: row.isActive !== false,
      importBatch: importBatchId,
      importType: "item",
      importLine: lineIndex,
      price: row.price ?? 0,
      description: row.description || "",
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
    });
    await itemDoc.save();
  } else {
    throw new Error(`Unknown row type '${row.type}'`);
  }
}

// Helper: update subfields for an existing doc
async function updateDocFields(doc, row, errors) {
  // if it's a service doc
  if (doc.importType === "service") {
    doc.description = row.description || doc.description;
    // doc.isActive = row.isActive !== false; // if you want
    await doc.save();
  } else if (doc.importType === "category") {
    doc.description = row.description || doc.description;
    // doc.isActive = row.isActive !== false;
    await doc.save();
  } else if (doc.importType === "item") {
    // item => update everything
    doc.description = row.description || doc.description;
    if (row.price != null) doc.price = row.price;
    if (row.vegNonVeg) doc.vegNonVeg = row.vegNonVeg;
    if (row.portionInfo) doc.portionInfo = row.portionInfo;

    doc.nutritionalInfo.calories = row.calories ?? doc.nutritionalInfo.calories;
    doc.nutritionalInfo.protein = row.protein ?? doc.nutritionalInfo.protein;
    doc.nutritionalInfo.carbs = row.carbs ?? doc.nutritionalInfo.carbs;
    doc.nutritionalInfo.fat = row.fat ?? doc.nutritionalInfo.fat;

    if (row.allergens) {
      doc.allergens = row.allergens.split(",");
    }
    if (row.ingredients) {
      doc.ingredients = row.ingredients.split(",");
    }
    doc.imageUrl = row.imageUrl || doc.imageUrl;
    if (row.available != null) doc.available = row.available !== false;
    if (row.isSpecial != null) doc.isSpecial = row.isSpecial === true;
    await doc.save();
  }
}

module.exports = {
  // full upload
  bulkImport,
  // merge-update
  bulkMergeUpdate,
};
