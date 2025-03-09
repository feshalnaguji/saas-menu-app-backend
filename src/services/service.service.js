// src/services/service.service.js

const Service = require("../models/Service");

/**
 * Create a new service
 * @param {Object} data - The service data (including restaurantId)
 * @returns {Promise<Service>}
 */
async function createService(data) {
  const service = new Service(data);
  return await service.save();
}

/**
 * Get all services for a given restaurant
 * @param {String} restaurantId
 * @returns {Promise<Service[]>}
 */
async function getServicesByRestaurant(restaurantId) {
  return await Service.find({
    restaurantId,
    isActive: true,
  }).sort({ createdAt: -1 });
}

/**
 * Update a service by ID
 * @param {String} id - Service's ObjectId
 * @param {Object} data
 * @returns {Promise<Service|null>}
 */
async function updateService(id, data) {
  return await Service.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Deactivate a service by ID
 * @param {String} id
 * @returns {Promise<Service|null>}
 */
async function deactivateService(id) {
  return await Service.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
}

module.exports = {
  createService,
  getServicesByRestaurant,
  updateService,
  deactivateService,
};
