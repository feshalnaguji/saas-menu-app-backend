// src/models/Restaurant.js

const mongoose = require("mongoose");

const RestaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
    },
    gstNumber: {
      type: String,
      default: "",
    },
    fssaiLicense: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
      // If you need lat/long, consider an array: [Number]
    },
    phone: {
      type: String,
      default: "",
    },
    openTime: {
      type: String,
      default: "", // e.g., "09:00"
    },
    closeTime: {
      type: String,
      default: "", // e.g., "22:00"
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model("Restaurant", RestaurantSchema);
