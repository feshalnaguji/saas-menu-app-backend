// src/models/Service.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ServiceSchema = new Schema(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optionally track which batch (excel import) this service was created in
    importBatch: {
      type: String,
      default: "",
    },
    // new fields:
    importLine: { type: Number, default: null }, // row index
    importType: { type: String, default: "service" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", ServiceSchema);
