const jwt = require("jsonwebtoken");
const User = require("./userModel");
require("dotenv").config(); // Ensure environment variables are loaded

const authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header

    if (!token) {
      console.error("❌ No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in environment variables!");
      return res.status(500).json({ error: "Internal server error: Missing JWT secret" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);

    const userId = decoded.userId || decoded._id; // Ensure compatibility with different JWT structures

    if (!userId) {
      console.error("❌ No userId found in token payload.");
      return res.status(401).json({ error: "Unauthorized: Invalid token data" });
    }

    // 🔍 Ensure user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found for token userId:", userId);
      return res.status(401).json({ error: "Unauthorized: Invalid user" });
    }

    req.userId = userId.toString(); // Ensure userId is a string
    console.log("🟢 Middleware Authenticated User ID:", req.userId);

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authenticate;
