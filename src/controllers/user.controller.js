// src/controllers/user.controller.js

const userService = require("../services/user.service");

/**
 * GET /api/users
 * superadmin can see all, maybe admin sees only themselves (your choice).
 */
async function getAll(req, res) {
  try {
    // if you only want superadmin to see all, ensure route is protected accordingly
    const users = await userService.getAllUsers();
    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/users/:id
 * superadmin can see any, or if user == current user => can see self, else 403
 */
async function getOne(req, res) {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // If superadmin => skip. If admin => can they see others? If user => see only self?
    // Example: if (req.user.role !== 'superadmin' && req.user.userId !== id) => 403
    if (
      req.user.role !== "superadmin" &&
      String(req.user.userId) !== String(id)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * PUT /api/users/:id
 * superadmin can update user's role, assignedRestaurants, etc.
 */
async function update(req, res) {
  try {
    const { id } = req.params;

    // if not superadmin => maybe can only update themselves
    if (
      req.user.role !== "superadmin" &&
      String(req.user.userId) !== String(id)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    // If admin tries to set role=superadmin => block, etc.

    const updated = await userService.updateUser(id, req.body);
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "User not found or not updated" });
    }
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * DELETE /api/users/:id
 */
async function remove(req, res) {
  try {
    const { id } = req.params;
    if (req.user.role !== "superadmin") {
      // typically only superadmin can delete users
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    const result = await userService.deleteUser(id);
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, message: `Deleted user ${id}` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getAll,
  getOne,
  update,
  remove,
};
