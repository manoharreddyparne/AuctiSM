const express = require("express");
const router = express.Router();
const verifyToken = require("./verifyToken");
const User = require("./userModel");

// ✅ Get user profile (Protected) - Enhanced with Google login check
router.get("/", verifyToken, async (req, res) => {
  try {
    // Check if user exists using the userId decoded from the JWT
    const user = await User.findById(req.user.userId).select("name email googleId password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the user logged in with Google and doesn't have a password set, inform them
    if (user.googleId && !user.password) {
      return res.status(200).json({
        message: "User logged in via Google. Please set a password for manual login.",
        user: { name: user.name, email: user.email, googleLogin: true }
      });
    }

    // If the user has a password (manual login), send user data
    res.status(200).json({
      message: "User profile fetched successfully",
      user: { name: user.name, email: user.email, googleLogin: false }
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
