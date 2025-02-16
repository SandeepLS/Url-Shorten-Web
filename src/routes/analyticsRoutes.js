const express = require("express");
const { getTopicAnalytics, getOverallAnalytics } = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get analytics for a specific topic & OverallAnalytics
router.get("/topic/:topic", authMiddleware, getTopicAnalytics);
router.get("/overall", authMiddleware, getOverallAnalytics);

module.exports = router;
