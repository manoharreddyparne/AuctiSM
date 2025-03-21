const express = require("express");
const { register, login, googleLogin, resetPassword } = require("./authController");
const authenticate = require("./authMiddleware");
const User = require("./userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createAuction } = require("./auctionController");
require("dotenv").config();

const router = express.Router();

router.use((req, res, next) => {
  //debug
  //console.log(" Incoming Request:", req.method, req.url);
  //console.log(" Headers:", req.headers);
  next();
});

router.post("/signup", register);
router.post("/login", login);
router.post("/google-login", googleLogin);
router.post("/reset-password", resetPassword); 

router.get("/profile", authenticate, async (req, res) => {
  try {
    //debug
    //console.log(" Fetching profile for user ID:", req.userId);

    if (!req.userId) {
      //debug
      //console.log(" No userId found in token.");
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const user = await User.findById(req.userId).select("-password -__v");
    if (!user) {
      //debug
      //console.log(" User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    //debug
    //console.log("✅ Profile data fetched successfully:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error(" Error fetching profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.post("/set-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Invalid email or weak password (min 6 chars)" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      console.log(" User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();
    //debug
    //console.log(` Password set successfully for user: ${email}`);
    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    console.error(" Error setting password:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
router.post("/login", async (req, res) => {
  const { email, authProvider, googleId, password } = req.body;
  try {

    if (authProvider === "google") {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send("User not found");
      if (user.googleId !== googleId) {
        return res.status(400).send("Invalid Google ID");
      }

      const token = jwt.sign(
        { userId: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );
      return res.status(200).json({ token, needsPassword: user.needsPassword });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send("User not found");

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).send("Invalid credentials");

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ token, needsPassword: user.needsPassword });
  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).send("Internal server error");
  }
});
router.post("/auctions/create", authenticate, createAuction);

module.exports = router;
