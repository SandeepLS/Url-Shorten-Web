const express = require("express");
const { createShorten, redirectUrl, getUrlAnalytics } = require('../controllers/urlController')
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Shorten a URL
router.post("/shorten", authMiddleware, createShorten );
router.get('/:shortUrl', redirectUrl);
router.get('/analytics/:alias', authMiddleware, getUrlAnalytics);

module.exports = router;
