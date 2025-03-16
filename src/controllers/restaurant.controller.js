// src/controllers/restaurant.controller.js

const restaurantService = require("../services/restaurant.service");
const QRCode = require("qrcode");

/**
 * Create new restaurant
 * req.body: { name, gstNumber, fssaiLicense, address, location, etc. }
 */
async function create(req, res, next) {
  try {
    const data = req.body;
    const restaurant = await restaurantService.createRestaurant(data);
    return res.status(201).json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
}

/**
 * Get all active restaurants
 */
async function getAll(req, res, next) {
  try {
    const restaurants = await restaurantService.getAllRestaurants();
    return res.json({ success: true, data: restaurants });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single restaurant by ID
 */
async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const restaurant = await restaurantService.getRestaurantById(id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    return res.json({ success: true, data: restaurant });
  } catch (err) {
    next(err);
  }
}

/**
 * Update restaurant by ID
 */
async function update(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await restaurantService.updateRestaurant(id, data);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found or not updated",
      });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate (soft delete) a restaurant by ID
 */
async function deactivate(req, res, next) {
  try {
    const { id } = req.params;
    const result = await restaurantService.deactivateRestaurant(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Generate a QR code for a restaurant's slug
 * GET /api/restaurants/:id/qr
 */
async function getQRCode(req, res) {
  try {
    const { id } = req.params;
    // Use the service layer for consistency
    const restaurant = await restaurantService.getRestaurantById(id);
    if (!restaurant) {
      return res
        .status(404)
        .json({ success: false, message: "Restaurant not found" });
    }

    // If your Restaurant model has a 'slug' field:
    if (!restaurant.slug) {
      return res.status(400).json({
        success: false,
        message: "Restaurant does not have a slug to generate QR code.",
      });
    }

    // Build the URL that the QR code should link to
    const url = `https://myapp.com/site/restaurant/${restaurant.slug}`;

    // Generate a QR code data URL
    const qrData = await QRCode.toDataURL(url);

    // Return base64 representation
    return res.json({ success: true, data: qrData });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  create,
  getAll,
  getOne,
  update,
  deactivate,
  getQRCode, // Export the new method
};
