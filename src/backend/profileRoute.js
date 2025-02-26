const express = require("express");
const router = express.Router();
const verifyToken = require("./verifyToken");
const User = require("./userModel");

// ✅ Get user profile (Protected) - Enhanced for Google login users
router.get("/", verifyToken, async (req, res) => {
  try {
    // Fetch the user using the userId from the decoded token
    const user = await User.findById(req.user.userId).select("fullName email googleId password");

    if (!user) {
      console.log("❌ User not found:", req.user.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // If the user logged in via Google and hasn't set a manual password, indicate that
    if (user.googleId && !user.password) {
      return res.status(200).json({
        message: "User logged in via Google. Please set a password for manual login.",
        user: { name: user.fullName, email: user.email, googleLogin: true }
      });
    }

    // For manual login users (or Google users who have set a password), return profile data
    res.status(200).json({
      message: "User profile fetched successfully",
      user: { name: user.fullName, email: user.email, googleLogin: false }
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
