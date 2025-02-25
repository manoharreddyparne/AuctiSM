const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dotenv.config();

const config = require("./config/config");
const routes = require("./routes");
const profileRoute = require("./profileRoute");
const User = require("./userModel"); // Assuming you have a User model

const app = express();

// ✅ Middleware
app.use(morgan("dev")); // Logs requests for debugging
app.use(cookieParser());
app.use(express.json());

// ✅ Debugging Request Headers
app.use((req, res, next) => {
  console.log("🔵 Incoming Request:", req.method, req.url);
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", req.body);
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000", // Adjust based on your front-end URL
    credentials: true,
  })
);

// ✅ Routes
app.use("/api", routes);
app.use(
  "/api/profile",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  },
  profileRoute
);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("AuctiSM Backend is running");
});

// ✅ Password reset route
const authenticate = require("./authMiddleware"); // Import authentication middleware

// Password reset functionality
app.post("/api/reset-password", authenticate, async (req, res) => {
  const { newPassword } = req.body; // Expecting the new password in the request body

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    // Find the user based on the user ID attached to the request (from the JWT)
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate password (e.g., minimum length or strength)
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Update the user's password (hash it before saving in production)
    user.password = newPassword; // In production, use bcrypt to hash the password
    user.authProvider = "manual";  // Change auth provider to manual after setting password
    user.needsPassword = false;   // No longer need to reset the password
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Google Login Route - This allows users to login via Google and set passwords if needed
const authController = require("./authController"); // Import the authentication controller

app.post("/api/google-login", authController.googleLogin);

// Password set route for Google users who need to set their password
app.post("/api/set-password", authenticate, async (req, res) => {
  const { email, password } = req.body;
  console.log("🔵 Setting password for Google user:", email);

  if (!email || !password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long" });
  }

  try {
    // Find user based on the email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.authProvider !== "google") {
      return res.status(400).json({ message: "Only Google login users can set a password" });
    }

    // Hash the password before saving
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";  // Set the auth provider to manual after setting the password
    user.needsPassword = false;   // Remove the need to reset the password
    await user.save();

    res.status(200).json({ message: "Password set successfully. You can now log in manually." });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Database Connection
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // ✅ Start Server Only After DB Connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit on DB failure
  });
