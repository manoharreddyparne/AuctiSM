const User = require('./userModel');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/config.js');

// Register new user
const register = async (req, res) => {
  const { fullName, email, phone, dob, address, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ fullName, email, phone, dob, address, password });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Error creating user. Please try again.' });
  }
};

// Login existing user and generate JWT
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Include email in JWT payload
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: "1h" }
    );

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    // Send email in response
    res.status(200).json({ message: "Login successful", token, email: user.email });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in. Please try again." });
  }
};


module.exports = { register, login };
