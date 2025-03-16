// src/models/Restaurant.js

const mongoose = require("mongoose");
const shortid = require("shortid"); // or nanoid

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
    slug: { type: String, unique: true },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Generate slug on creation if not set
RestaurantSchema.pre("save", function (next) {
  if (!this.slug) {
    this.slug = shortid.generate();
  }
  next();
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
