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

module.exports = {
  createMenuItem,
  getItemsByCategory,
  updateMenuItem,
  disableMenuItem,
};
