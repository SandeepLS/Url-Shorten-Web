const mongoose = require("mongoose");

const AnalyticsSchema = new mongoose.Schema({
    shortUrl: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    ip: { type: String, required: true },
    userAgent: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    os: { type: String },
    device: { type: String }
});

module.exports = mongoose.model("Analytics", AnalyticsSchema);
