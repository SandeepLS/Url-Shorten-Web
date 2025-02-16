const Analytics = require("../models/Analytics");
const Url = require("../models/Url");

// get Topic
exports.getTopicAnalytics = async (req, res) => {
    try {
        const topic = req.params.topic;

        const urls = await Url.find({ topic });

        if (urls.length === 0) {
            return res.status(404).json({ error: "No URLs found for this topic" });
        }

        const shortUrls = urls.map(url => url.shortUrl);
        const analyticsData = await Analytics.find({ shortUrl: { $in: shortUrls } });

        const totalClicks = analyticsData.length;
        const uniqueUsers = new Set(analyticsData.map(entry => entry.ip)).size;

        const clicksByDate = {};
        analyticsData.forEach(entry => {
            if (entry.createdAt) { 
                const date = new Date(entry.createdAt).toISOString().split("T")[0]; // Format YYYY-MM-DD
                clicksByDate[date] = (clicksByDate[date] || 0) + 1;
            }
        });

        const clicksByDateArray = Object.entries(clicksByDate).map(([date, count]) => ({
            date,
            totalClicks: count
        }));

        const urlAnalytics = urls.map(url => {
            const urlClicks = analyticsData.filter(entry => entry.shortUrl === url.shortUrl);
            const uniqueUrlUsers = new Set(urlClicks.map(entry => entry.ip)).size;
            
            return {
                shortUrl: url.shortUrl,
                totalClicks: urlClicks.length,
                uniqueUsers: uniqueUrlUsers
            };
        });

        res.json({
            topic,
            totalClicks,
            uniqueUsers,
            clicksByDate: clicksByDateArray,
            urls: urlAnalytics
        });

    } catch (error) {
        console.error("Topic Analytics Fetch Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};

// Get overall(Fetch all URLs created by the user)
exports.getOverallAnalytics = async (req, res) => {
    try {
        const userId = req.user.googleId;

        const urls = await Url.find({ createdBy: userId });
        if (!urls.length) {
            return res.json({
                totalUrls: 0,
                totalClicks: 0,
                uniqueUsers: 0,
                clicksByDate: [],
                osType: [],
                deviceType: []
            });
        }

        const shortUrls = urls.map(url => url.shortUrl);
        const analyticsData = await Analytics.find({ shortUrl: { $in: shortUrls } });

        let totalClicks = 0;
        const uniqueUsersSet = new Set();
        const clicksByDateMap = new Map();
        const osTypeMap = new Map();
        const deviceTypeMap = new Map();

        analyticsData.forEach(entry => {
            totalClicks++;
            uniqueUsersSet.add(entry.ip);

            const date = entry.timestamp.toISOString().split('T')[0];
            clicksByDateMap.set(date, (clicksByDateMap.get(date) || 0) + 1);

            if (entry.os) {
                const osData = osTypeMap.get(entry.os) || { uniqueClicks: 0, uniqueUsers: new Set() };
                osData.uniqueClicks++;
                osData.uniqueUsers.add(entry.userId);
                osTypeMap.set(entry.os, osData);
            }

            if (entry.device) {
                const deviceData = deviceTypeMap.get(entry.device) || { uniqueClicks: 0, uniqueUsers: new Set() };
                deviceData.uniqueClicks++;
                deviceData.uniqueUsers.add(entry.userId);
                deviceTypeMap.set(entry.device, deviceData);
            }
        });

        const clicksByDate = Array.from(clicksByDateMap, ([date, totalClicks]) => ({ date, totalClicks }));
        const osType = Array.from(osTypeMap, ([osName, data]) => ({ osName, uniqueClicks: data.uniqueClicks, uniqueUsers: data.uniqueUsers.size }));
        const deviceType = Array.from(deviceTypeMap, ([deviceName, data]) => ({ deviceName, uniqueClicks: data.uniqueClicks, uniqueUsers: data.uniqueUsers.size }));

        res.json({
            totalUrls: urls.length,
            totalClicks,
            uniqueUsers: uniqueUsersSet.size,
            clicksByDate,
            osType,
            deviceType
        });
    } catch (error) {
        console.error("Overall Analytics Fetch Error:", error);
        res.status(500).json({ error: "Server error" });
    }
};