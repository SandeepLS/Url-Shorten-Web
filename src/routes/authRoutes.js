const express = require("express");
const passport = require("passport");
const authMiddleware = require('../middleware/authMiddleware')
const router = express.Router();

// Google Auth Route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google Auth Callback
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const { user, token } = req.user;
        res.cookie("token", token, { httpOnly: true }); // Store JWT in cookie
        res.json({ user, token });
    }
);

// Logout Route
router.get("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});

// Protected profile Route 
router.get("/profile", authMiddleware, (req, res) => {
    res.json({
      message: "Profile accessed successfully!",
      user: req.user, // This is the decoded JWT user info
    });
  });

module.exports = router;
