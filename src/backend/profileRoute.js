const express = require("express");
const router = express.Router();
const verifyToken = require("./verifyToken");
const User = require("./userModel");

// ✅ Get user profile (Protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("🔍 Fetching user profile for:", req.user.userId);

    // Ensure userId is properly retrieved from token
    if (!req.user || !req.user.userId) {
      console.error("❌ Invalid token payload");
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch the user using the correct userId
    const user = await User.findById(req.user.userId).select("fullName email googleId password");

    if (!user) {
      console.log("❌ User not found:", req.user.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Handle Google login users who haven't set a password
    if (user.googleId && !user.password) {
      return res.status(200).json({
        message: "User logged in via Google. Please set a password for manual login.",
        user: { name: user.fullName, email: user.email, googleLogin: true },
      });
    }

    // ✅ Return profile data for all users
    res.status(200).json({
      message: "User profile fetched successfully",
      user: { name: user.fullName, email: user.email, googleLogin: false },
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
