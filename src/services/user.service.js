// src/services/user.service.js

const User = require("../models/User");

/**
 * Get all users
 */
async function getAllUsers() {
  return User.find().sort({ createdAt: -1 });
}

/**
 * Get single user by ID
 */
async function getUserById(id) {
  return User.findById(id);
}

/**
 * Update user
 * (e.g. role, name, assignedRestaurants)
 */
async function updateUser(id, data) {
  return User.findByIdAndUpdate(id, data, { new: true });
}

/**
 * Delete user
 */
async function deleteUser(id) {
  return User.findByIdAndDelete(id);
}

// If you want partial logic to ensure we don't override password/role
// you can do that in controller or service.

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
