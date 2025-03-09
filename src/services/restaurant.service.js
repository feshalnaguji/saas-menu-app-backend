// src/services/restaurant.service.js

const Restaurant = require("../models/Restaurant");

/**
 * Create a new restaurant
 * @param {Object} data - The restaurant data
 * @returns {Promise<Restaurant>}
 */
async function createRestaurant(data) {
  const restaurant = new Restaurant(data);
  return await restaurant.save();
}

/**
 * Get all restaurants
 * @returns {Promise<Restaurant[]>}
 */
async function getAllRestaurants() {
  return await Restaurant.find({ isActive: true }).sort({ createdAt: -1 });
}

/**
 * Get a single restaurant by ID
 * @param {String} id - The restaurant's ObjectId
 * @returns {Promise<Restaurant|null>}
 */
async function getRestaurantById(id) {
  return await Restaurant.findById(id);
}

/**
 * Update a restaurant by ID
 * @param {String} id - The restaurant's ObjectId
 * @param {Object} data - The new data
 * @returns {Promise<Restaurant|null>}
 */
async function updateRestaurant(id, data) {
  return await Restaurant.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Soft-delete or deactivate a restaurant by ID (optional)
 * @param {String} id
 * @returns {Promise<Restaurant|null>}
 */
async function deactivateRestaurant(id) {
  return await Restaurant.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deactivateRestaurant,
};
