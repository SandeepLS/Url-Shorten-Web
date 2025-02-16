const { validateUrl, generateShortCode } = require('../utils/urlUtils')
const Url = require("../models/Url");
require("dotenv").config();
const UAParser = require("ua-parser-js");
const Analytics = require('../models/Analytics')

const BASE_URL = process.env.BASE_URL;

// Shorten a URL
exports.createShorten = async (req, res) => {
    const { originalUrl, topic } = req.body;
    const createdBy = req.user.googleId; // Authenticated user ID

    if (!validateUrl(originalUrl)) {
        return res.status(400).json({ error: "Invalid URL" });
    }

    try {
        let existingUrl = await Url.findOne({ originalUrl, createdBy });
        if (existingUrl) return res.json(existingUrl);

        const shortCode = generateShortCode();
        const shortUrl = `${BASE_URL}/${shortCode}`;

        const newUrl = await Url.create({ originalUrl, shortUrl, createdBy, topic: topic || "General" });

        res.json(newUrl);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

// Redirect short URL to original URL(As a String)
exports.redirectUrl = async (req, res) => {
    try {
     const shortCode = req.params.shortUrl;
     const url = await Url.findOne({ shortUrl: `${BASE_URL}/${shortCode}` });

      if (!url) {
        return res.status(404).send({ error: 'URL not found' });
      }

      // Parse User-Agent
      const parser = new UAParser(req.headers["user-agent"]);
      const uaResult = parser.getResult();
      const os = uaResult.os.name || "Unknown";
      const device = uaResult.device.type || "Desktop";

      // Log analytics
      await Analytics.create({
          shortUrl: url.shortUrl,
          ip: req.ip, // IP tracking
          userAgent: req.headers["user-agent"],
          createdAt: new Date(),
          os,
          device
      });

  
      url.clicks += 1;
      await url.save();
  
      res.redirect(url.originalUrl);
    } catch (error) {
      console.error('Redirect error:', error);
      res.status(500).send('Server error');
    }

};

// Helper function to get date range (last 7 days)
const getDateRange = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        let date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split("T")[0]); // Format: YYYY-MM-DD
    }
    return dates;
};

// Fetch analytics for a specific short URL
exports.getUrlAnalytics = async (req, res) => {
    try {
        const alias = req.params.alias;
        const shortUrl = `${process.env.BASE_URL}/${alias}`;

        // Check if the URL exists
        const url = await Url.findOne({ shortUrl });
        if (!url) return res.status(404).json({ error: "Short URL not found" });

        // Fetch analytics data
        const analyticsData = await Analytics.find({ shortUrl });

        // Total clicks
        const totalClicks = analyticsData.length;

        // Unique users by IP
        const uniqueUsers = new Set(analyticsData.map((entry) => entry.ip)).size;

        // Clicks by Date
        const dateRange = getDateRange();
        const clicksByDate = dateRange.map(date => ({
            date,
            clickCount: analyticsData.filter(entry => entry.timestamp.toISOString().split("T")[0] === date).length
        }));

        // OS Distribution
        const osData = {};
        analyticsData.forEach(entry => {
            osData[entry.os] = osData[entry.os] ? osData[entry.os] + 1 : 1;
        });
        const osType = Object.entries(osData).map(([osName, uniqueClicks]) => ({
            osName,
            uniqueClicks
        }));

        // Device Type Distribution
        const deviceData = {};
        analyticsData.forEach(entry => {
            deviceData[entry.device] = deviceData[entry.device] ? deviceData[entry.device] + 1 : 1;
        });
        const deviceType = Object.entries(deviceData).map(([deviceName, uniqueClicks]) => ({
            deviceName,
            uniqueClicks
        }));

        res.json({
            totalClicks,
            uniqueUsers,
            clicksByDate,
            osType,
            deviceType
        });

    } catch (error) {
        console.error("Analytics Fetch Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};
