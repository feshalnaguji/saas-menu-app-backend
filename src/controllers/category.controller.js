// src/controllers/category.controller.js

const categoryService = require("../services/category.service");

/**
 * Create new category
 * req.body: { serviceId, name, description, etc. }
 */
async function create(req, res, next) {
  try {
    const data = req.body;
    const category = await categoryService.createCategory(data);
    return res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
}

/**
 * Get categories by service
 */
async function getByService(req, res, next) {
  try {
    const { serviceId } = req.params;
    const categories = await categoryService.getCategoriesByService(serviceId);
    return res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
}

/**
 * Update category
 */
async function update(req, res, next) {
  try {
    const { id } = req.params; // category id
    const data = req.body;
    const updated = await categoryService.updateCategory(id, data);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found or not updated" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/**
 * Deactivate category
 */
async function deactivate(req, res, next) {
  try {
    const { id } = req.params;
    const result = await categoryService.deactivateCategory(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found" });
    }
    return res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  create,
  getByService,
  update,
  deactivate,
};
