const mongoose = require("mongoose");

const UrlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
  clicks: { type: Number, default: 0 },
  createdBy: { type: String, required: true }, 
  topic: { type: String, default: "General" },
  createdAt: { type: Date, default: Date.now },
});

UrlSchema.index({ shortUrl: 1 }); 
UrlSchema.index({ createdBy: 1 }); 
UrlSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Url", UrlSchema);
