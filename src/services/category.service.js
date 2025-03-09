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

module.exports = {
  createCategory,
  getCategoriesByService,
  updateCategory,
  deactivateCategory,
};
