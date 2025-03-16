// src/services/category.service.js

const Category = require("../models/Category");

/**
 * Create a new category
 * @param {Object} data - The category data (including serviceId)
 * @returns {Promise<Category>}
 */
async function createCategory(data) {
  const category = new Category(data);
  return await category.save();
}

/**
 * Get categories by service
 * @param {String} serviceId
 * @returns {Promise<Category[]>}
 */
async function getCategoriesByService(serviceId) {
  return await Category.find({
    serviceId,
    isActive: true,
  }).sort({ createdAt: -1 });
}

/**
 * Update a category
 * @param {String} id
 * @param {Object} data
 * @returns {Promise<Category|null>}
 */
async function updateCategory(id, data) {
  return await Category.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Deactivate category
 * @param {String} id
 * @returns {Promise<Category|null>}
 */
async function deactivateCategory(id) {
  return await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

/**
 * Get all categories (across all restaurants)
 * @returns {Promise<AllCategories[]>}
 */
async function getAllCategoriesGlobal() {
  return Category.find().sort({ createdAt: -1 });
}

/**
 * Delete all categories (across all restaurants)
 * @returns {Promise<AllCategories|null>}
 */
async function deleteAllCategories() {
  return Category.deleteMany({});
}

// New services
async function enableCategory(id) {
  return Category.findByIdAndUpdate(id, { isActive: true }, { new: true });
}
async function disableCategory(id) {
  return Category.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

// enable/disable all for a given service
async function enableAllByService(serviceId) {
  return Category.updateMany({ serviceId }, { $set: { isActive: true } });
}
async function disableAllByService(serviceId) {
  return Category.updateMany({ serviceId }, { $set: { isActive: false } });
}
// delete all categories for service
async function deleteAllByService(serviceId) {
  return Category.deleteMany({ serviceId });
}

module.exports = {
  createCategory,
  getCategoriesByService,
  updateCategory,
  deactivateCategory,
  getAllCategoriesGlobal,
  deleteAllCategories,
  enableCategory,
  disableCategory,
  enableAllByService,
  disableAllByService,
  deleteAllByService,
};
