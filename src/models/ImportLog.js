// src/models/ImportLog.js

const mongoose = require("mongoose");
const { Schema } = mongoose;

const ImportLogSchema = new Schema(
  {
    fileName: {
      type: String,
      required: true,
    },
    importedAt: {
      type: Date,
      default: Date.now,
    },
    rowCount: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failCount: {
      type: Number,
      default: 0,
    },
    errorLogs: {
      type: [String],
      default: [],
    },
    importedBy: {
      type: String,
      default: "Guest Admin",
    },
    importBatchId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ImportLog", ImportLogSchema);
