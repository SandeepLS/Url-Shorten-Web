const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  createdBy: { type: String, required: true }, // User ID (Google ID)
  topic: { type: String, default: "General" },
  createdAt: { type: Date, default: Date.now },
});

// Add an index to improve query performance for lookups
UrlSchema.index({ shortUrl: 1 }); // Index for quick redirection lookup
UrlSchema.index({ createdBy: 1 }); // Index for fetching user-specific URLs efficiently
UrlSchema.index({ createdAt: -1 }); // Index for sorting URLs by creation date (optional)

module.exports = mongoose.model("Url", UrlSchema);

// const urlSchema = new mongoose.Schema({
//     longUrl: { type: String, required: true },
//     shortUrl: { type: String, unique: true, required: true },
//     customAlias: { type: String, unique: true, sparse: true },
//     topic: { type: String, enum: ["acquisition", "activation", "retention"], default: "acquisition" },
//     createdBy: { type: String, ref: "User", required: true },
//     createdAt: { type: Date, default: Date.now },
//     clicks: { type: Number, default: 0 } // Add this line
//   });
