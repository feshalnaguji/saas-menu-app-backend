// src/services/menuItem.service.js

const MenuItem = require("../models/MenuItem");

/**
 * Create a new menu item
 * @param {Object} data - The menu item data (including categoryId)
 * @returns {Promise<MenuItem>}
 */
async function createMenuItem(data) {
  const item = new MenuItem(data);
  return await item.save();
}

/**
 * Get items by category
 * @param {String} categoryId
 * @returns {Promise<MenuItem[]>}
 */
async function getItemsByCategory(categoryId) {
  return await MenuItem.find({
    categoryId,
    available: true,
  }).sort({ createdAt: -1 });
}

/**
 * Update a menu item
 * @param {String} id
 * @param {Object} data
 * @returns {Promise<MenuItem|null>}
 */
async function updateMenuItem(id, data) {
  return await MenuItem.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Mark a menu item as unavailable/disable it
 * @param {String} id
 * @returns {Promise<MenuItem|null>}
 */
async function disableMenuItem(id) {
  return await MenuItem.findByIdAndUpdate(
    id,
    { available: false },
    { new: true }
  );
}

// New global methods
async function getAllItemsGlobal() {
  return await MenuItem.find().sort({ createdAt: -1 });
}

async function deleteAllItemsGlobal() {
  return MenuItem.deleteMany({});
}

/**
 * Enable/Disable single item
 */
async function enableOne(id) {
  return MenuItem.findByIdAndUpdate(id, { isActive: true }, { new: true });
}
async function disableOne(id) {
  return MenuItem.findByIdAndUpdate(id, { isActive: false }, { new: true });
}

/**
 * Enable/Disable all items by category
 */
async function enableAllByCategory(categoryId) {
  return MenuItem.updateMany({ categoryId }, { $set: { isActive: true } });
}
async function disableAllByCategory(categoryId) {
  return MenuItem.updateMany({ categoryId }, { $set: { isActive: false } });
}

/**
 * Delete all items by category
 */
async function deleteAllByCategory(categoryId) {
  return MenuItem.deleteMany({ categoryId });
}

module.exports = {
  createMenuItem,
  getItemsByCategory,
  updateMenuItem,
  disableMenuItem,
  getAllItemsGlobal,
  deleteAllItemsGlobal,
  enableOne,
  disableOne,
  enableAllByCategory,
  disableAllByCategory,
  deleteAllByCategory,
};
