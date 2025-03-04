const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

dotenv.config();

const config = require("./config/config");
const routes = require("./routes");
const profileRoute = require("./profileRoute");
const User = require("./userModel");
const authenticate = require("./authMiddleware"); // Authentication middleware
const authController = require("./authController"); // Auth controller for Google login, etc.

const app = express();

// ------------------
// Middleware Setup
// ------------------
app.use(morgan("dev")); // Logs requests for debugging
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust based on your frontend URL
    credentials: true,
  })
);

// Debugging: log incoming request headers and body
app.use((req, res, next) => {
  console.log("🔵 Incoming Request:", req.method, req.url);
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", req.body);
  next();
});

// ------------------
// AWS Routes Section
// ------------------
// This section is dedicated to AWS S3 integration for generating pre-signed URLs.
// It does not affect your existing routes.
const awsRoutes = require("./awsRoutes");
app.use("/api/aws", awsRoutes);
// Now, the endpoint for pre-signed URL generation is available at: /api/aws/s3/sign

// ------------------
// Existing Routes
// ------------------

// Mount API routes
app.use("/api", routes);

// Protected Profile Route
app.use(
  "/api/profile",
  (req, res, next) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  },
  profileRoute
);

// Test Route
app.get("/", (req, res) => {
  res.send("AuctiSM Backend is running");
});

// ------------------
// Password Reset Route (Authenticated)
// This route is for users who already have a valid token and need to reset their password manually.
app.post("/api/reset-password", authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    // Find the user based on the authenticated user ID
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and update the password, switch authProvider to manual, and clear the needsPassword flag
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();

    console.log("✅ Password reset successful for:", user.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// Google Login Route
// This route uses the authController's googleLogin function.
app.post("/api/google-login", authController.googleLogin);

// ------------------
// Set Password Route for Google Users
// This route allows a Google user (who has not set a manual password) to set one.
// It is protected by the authentication middleware.
app.post("/api/set-password", authenticate, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Invalid email or weak password (min 6 chars)" });
    }

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow setting password if the user was created via Google
    if (user.authProvider !== "google") {
      return res
        .status(400)
        .json({ message: "Only Google login users can set a password" });
    }

    // Hash the new password, update the authProvider, and clear the needsPassword flag
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();

    console.log("✅ Password set successfully for Google user:", user.email);
    res.status(200).json({
      message: "Password set successfully. You can now log in manually.",
    });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// Database Connection & Server Start
// ------------------
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = app;
