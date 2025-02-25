const express = require("express");
const { register, login, googleLogin, resetPassword } = require("./authController");
const authenticate = require("./authMiddleware");
const User = require("./userModel");
const bcrypt = require("bcryptjs");

const router = express.Router();

// ✅ Debugging Middleware (Logs Requests)
router.use((req, res, next) => {
  console.log("🔵 Incoming Request:", req.method, req.url);
  console.log("🔹 Headers:", req.headers);
  next();
});

// ✅ Public Routes
router.post("/signup", register);
router.post("/login", login);
router.post("/google-login", googleLogin);

// ✅ Fetch User Profile (Protected Route)
router.get("/profile", authenticate, async (req, res) => {
  try {
    console.log("🟢 Fetching profile for user ID:", req.userId);

    const user = await User.findById(req.userId).select("-password -__v");
    if (!user) {
      console.log("❌ User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("✅ Profile data fetched successfully");
    res.status(200).json(user);
  } catch (error) {
    console.error("❌ Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Set Password for Google Users
router.post("/set-password", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Invalid email or weak password (min 6 chars)" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Hash and Update Password
    user.password = await bcrypt.hash(password, 10);
    user.authProvider = "manual"; // Allows future manual login
    await user.save();

    console.log(`✅ Password set successfully for user: ${email}`);
    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Password Reset Route
router.post("/reset-password", resetPassword);

module.exports = router;
