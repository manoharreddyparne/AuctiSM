const jwt = require("jsonwebtoken");
const User = require("./userModel");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.error("❌ No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in environment variables!");
      return res.status(500).json({ error: "Internal server error: Missing JWT secret" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if decoding was successful
    if (decoded) {
      console.log("✅ Token decoded for userId:", decoded.userId || decoded._id);
    }

    // Use userId from decoded payload (fallback to _id if needed)
    const userId = decoded.userId || decoded._id;
    if (!userId) {
      console.error("❌ No userId found in token payload.");
      return res.status(401).json({ error: "Unauthorized: Invalid token data" });
    }

    // Check if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      console.error("❌ User not found for token userId:", userId);
      return res.status(401).json({ error: "Unauthorized: Invalid user" });
    }

    // Attach the userId to the request for further use
    req.userId = userId.toString();
    console.log("🟢 Middleware Authenticated User ID:", req.userId);

    next(); // Proceed to next middleware or route handler
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    
    // Handling token expiration separately to give better feedback
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: Token expired" });
    }
    
    // Generic error for other token issues
    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authenticate;
