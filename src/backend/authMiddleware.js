const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config/config");

const authenticate = (req, res, next) => {
  try {
    let token = req.headers.authorization?.toString(); // Normalize header handling
    console.log("🔍 Received Token:", token);

    if (!token) {
      console.error("❌ No token provided");
      return res.status(401).json({ message: "Access denied. No token provided." });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7).trim();
    }

    console.log("🛠️ Token after trimming:", token);

    if (!JWT_SECRET) {
      console.error("❌ JWT_SECRET is missing in config!");
      return res.status(500).json({ message: "Internal server error: Missing JWT secret" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token Decoded:", decoded);

    const userId = decoded.userId || decoded._id; // Ensure compatibility with different JWT structures

    if (!userId) {
      console.error("❌ No userId found in token payload.");
      return res.status(401).json({ message: "Unauthorized: Invalid token data" });
    }

    req.userId = userId.toString(); // Ensure userId is a string
    console.log("🟢 Middleware Authenticated User ID:", req.userId);

    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};

module.exports = authenticate;
