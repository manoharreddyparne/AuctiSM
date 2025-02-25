const User = require('./userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { JWT_SECRET } = require('./config/config.js');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

if (!JWT_SECRET) {
  console.error("❌ JWT_SECRET is missing! Check your config.");
  process.exit(1); // Stop server if JWT_SECRET is missing
}

// ✅ Helper Function to Generate JWT Token
const generateToken = (user) => {
  return jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
};

// ✅ Register New User (Manual Signup)
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
    res.status(201).json({ message: 'User created successfully' });

  } catch (error) {
    console.error('🚨 Error creating user:', error);
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
};

// ✅ Login (Manual Login)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔵 Login attempt:", email);

    const user = await User.findOne({ email });
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

    const token = generateToken(user);
    res.cookie("authToken", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "Strict" });

    console.log("✅ Login successful:", email);
    res.status(200).json({ message: "Login successful", token, user: { id: user._id, email: user.email } });

  } catch (error) {
    console.error("🚨 Login error:", error);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
};

// ✅ Google Login
const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google login failed: No email received" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      // If the user is new, create an account without a password
      user = new User({
        fullName: name,
        email,
        profilePicture: picture,
        googleId: sub,
        authProvider: "google",
        needsPassword: true,  // ✅ Force password setup for Google users
      });
      await user.save();
      console.log("✅ New Google user created:", email);
    } else if (!user.password) {
      // If user exists but doesn't have a password set, flag as needing a password
      user.needsPassword = true;
      await user.save();
      console.log("🔵 Google user exists but needs a password:", email);
    }

    // Generate JWT Token
    const token = generateToken(user);

    res.json({
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.fullName,
        profilePicture: user.profilePicture,
      },
      needsPassword: user.needsPassword, // Ensure this is being sent correctly
    });
  } catch (error) {
    console.error("🚨 Google login error:", error);
    res.status(500).json({ message: "Internal server error during Google login" });
  }
};

// ✅ Set Password (For Google Users to Set a Manual Password)
const setPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔵 Setting password for user:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.authProvider !== "google") {
      return res.status(400).json({ message: "Only Google login users can set a password" });
    }

    // Validate password
    if (!password || password.length < 6) {
      console.warn("⚠️ Weak password attempt for:", email);
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";  // Change the provider to manual once password is set
    user.needsPassword = false;  // No longer need to reset password
    await user.save();

    console.log("✅ Password set successfully for:", email);
    res.json({ message: "Password set successfully. You can now log in manually." });

  } catch (error) {
    console.error("🚨 Error setting password:", error);
    res.status(500).json({ message: "Error setting password. Please try again." });
  }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    console.log("🔵 Password reset request for:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.warn("❌ User not found:", email);
      return res.status(400).json({ message: "User not found" });
    }

    if (!newPassword || newPassword.length < 6) {
      console.warn("⚠️ Weak password attempt for:", email);
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";  // Ensure the user can now log in manually
    user.needsPassword = false;  // User doesn't need to reset password anymore
    await user.save();

    console.log("✅ Password reset successful for:", email);
    res.json({ message: "Password reset successful. You can now log in manually." });

  } catch (error) {
    console.error("🚨 Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, googleLogin, setPassword, resetPassword };