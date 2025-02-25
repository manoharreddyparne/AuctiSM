const express = require("express");
const { register, login, googleLogin, resetPassword } = require("./authController");
const authenticate = require("./authMiddleware");
const User = require("./userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
router.post("/reset-password", resetPassword); // Added route for password reset

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


// ✅ Set Password for Google Users or Manual Users (One route for both)
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
    user.authProvider = "manual"; // Allows future manual login, even if Google login was used
    user.needsPassword = false; // Set needsPassword to false once password is set
    await user.save();

    console.log(`✅ Password set successfully for user: ${email}`);
    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Login Route (with Google and manual login handling)
router.post("/login", async (req, res) => {
  const { email, authProvider, googleId, password } = req.body;

  try {
    // For Google login
    if (authProvider === "google") {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send("User not found");

      if (user.googleId !== googleId) {
        return res.status(400).send("Invalid Google ID");
      }

      // Generate a JWT token
      const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      // Send token and needsPassword flag
      return res.status(200).json({ token, needsPassword: user.needsPassword });
    }

    // For manual login (using email and password)
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    // Compare password for manual users
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Send token and needsPassword flag
    res.status(200).json({ token, needsPassword: user.needsPassword });

  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
