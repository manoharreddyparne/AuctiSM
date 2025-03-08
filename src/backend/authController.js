const User = require('./userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require("dotenv").config();

const { OAuth2Client } = require('google-auth-library');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('./config/config.js');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error("❌ JWT_SECRET or JWT_REFRESH_SECRET is missing! Check your config.");
  process.exit(1);
}

// Helper Function to Generate Access & Refresh Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: "1h" }
  );
  const refreshToken = jwt.sign(
    { userId: user._id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

// Register New User (Manual Signup)
const register = async (req, res) => {
  try {
    const { fullName, email, phone, dob, address, password } = req.body;
    console.log("🟢 Registering user:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.warn("⚠️ User already exists:", email);
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      email,
      phone,
      dob,
      address,
      password: hashedPassword,
      authProvider: "manual",
      needsPassword: false
    });

    await newUser.save();
    console.log("✅ User registered successfully:", email);
    const { accessToken, refreshToken } = generateTokens(newUser);
    res.status(201).json({ 
      message: 'User created successfully',
      token: accessToken,
      refreshToken,
      user: { id: newUser._id, email: newUser.email }
    });
  } catch (error) {
    console.error('🚨 Error creating user:', error);
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
};

// Login (Manual Login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔵 Login attempt:", email);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.warn("❌ User not found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
      console.warn("🔴 No password set. Must reset password before manual login.");
      return res.status(400).json({ message: "Please reset your password to log in manually." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.warn("❌ Invalid credentials for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user);
    console.log("✅ Login successful:", email);
    res.status(200).json({ 
      message: "Login successful", 
      token: accessToken,
      refreshToken,
      user: { id: user._id, email: user.email }
    });
  } catch (error) {
    console.error("🚨 Login error:", error);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
};

// Google Login
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;
    if (!email) {
      return res.status(400).json({ message: "Google login failed: No email received" });
    }

    // Include the password field so we can check if it exists.
    let user = await User.findOne({ email }).select("+password");
    if (!user) {
      // New Google user: create account and force password reset.
      user = new User({
        fullName: name,
        email,
        profilePicture: picture,
        googleId: sub,
        authProvider: "google",
        needsPassword: true,
      });
      await user.save();
      console.log("✅ New Google user created:", email);
    } else if (!user.password) {
      // Existing Google user without a manual password set: require reset.
      user.needsPassword = true;
      await user.save();
      console.log("🔵 Google user exists but needs a password:", email);
    } else {
      // If the user already has a password, ensure needsPassword is false.
      user.needsPassword = false;
      await user.save();
    }

    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      message: "Google login successful",
      token: accessToken,
      refreshToken,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.fullName, 
        profilePicture: user.profilePicture 
      },
      needsPassword: user.needsPassword,
    });
  } catch (error) {
    console.error("🚨 Google login error:", error);
    res.status(500).json({ message: "Internal server error during Google login" });
  }
};

// Set Password for Google Users (Convert to Manual Login)
const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔵 Setting password for user:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (user.authProvider !== "google") {
      return res.status(400).json({ message: "Only Google login users can set a password" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.authProvider = "manual"; // Convert to manual login
    user.needsPassword = false;
    await user.save();

    console.log("✅ Password set successfully for:", email);
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      message: "Password set successfully. You can now log in manually.",
      token: accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error("🚨 Error setting password:", error);
    res.status(500).json({ message: "Error setting password. Please try again." });
  }
};

// Reset Password (Manual Reset)
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log("🔵 Password reset request for:", email);

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();

    console.log("✅ Password reset successful for:", email);
    const { accessToken, refreshToken } = generateTokens(user);
    res.json({
      message: "Password reset successful. You can now log in manually.",
      token: accessToken,
      refreshToken,
      user
    });
  } catch (error) {
    console.error("🚨 Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh Token Route
const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "Access Denied" });

    jwt.verify(token, JWT_REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid Token" });
      const { accessToken, refreshToken } = generateTokens(user);
      res.json({ accessToken, refreshToken });
    });
  } catch (error) {
    console.error("🚨 Refresh Token Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, googleLogin, setPassword, resetPassword, refreshToken };
