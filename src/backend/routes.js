const express = require("express");
const { register, login } = require("./authController");
const verifyToken = require("./verifyToken");
const User = require("./userModel");

const router = express.Router();

// Public Routes
router.post("/signup", register);
router.post("/login", login);

// ✅ Fixed: Fetch complete user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -__v"); // 🚀 Fetch all fields except password
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
