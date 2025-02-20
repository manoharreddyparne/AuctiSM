const express = require("express");
const router = express.Router();
const verifyToken = require("./verifyToken");
const User = require("./userModel");

// ✅ Get user profile (Protected)
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // ✅ Send user data directly
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
