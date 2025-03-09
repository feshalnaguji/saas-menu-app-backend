// src/controllers/menuItem.controller.js

const menuItemService = require("../services/menuItem.service");

/**
 * Create new menu item
 * req.body: { categoryId, name, price, etc. }
 */
async function create(req, res, next) {
  try {
    const data = req.body;
    const item = await menuItemService.createMenuItem(data);
    return res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
}

/**
 * Get items by category
 */
async function getByCategory(req, res, next) {
  try {
    const { categoryId } = req.params;
    const items = await menuItemService.getItemsByCategory(categoryId);
    return res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

/**
 * Update menu item
 */
async function update(req, res, next) {
  try {
    const { id } = req.params; // menu item id
    const data = req.body;
    const updated = await menuItemService.updateMenuItem(id, data);
    if (!updated) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Menu item not found or not updated",
        });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Disable (make unavailable) menu item
 */
async function disable(req, res, next) {
  try {
    const { id } = req.params;
    const result = await menuItemService.disableMenuItem(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Menu item not found" });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getByCategory,
  update,
  disable,
};
