const User = require('./userModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/config.js');

// Register new user
const register = async (req, res) => {
  const { fullName, email, phone, dob, address, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // User already exists
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create a new user
    const newUser = new User({ fullName, email, phone, dob, address, password });
    await newUser.save();

    // Success response
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    // Catching errors related to saving user
    console.error('Error creating user:', error); // Log error for debugging

    // Send generic error message, avoid exposing sensitive error details
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
};

// Login existing user and generate JWT
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });

    // **Set secure cookie**
    res.cookie("authToken", token, {
      httpOnly: true,  // Prevents XSS attacks
      secure: process.env.NODE_ENV === "production", // Ensures HTTPS in production
      sameSite: "Strict", // Protects against CSRF attacks
    });

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
};


module.exports = { register, login };
