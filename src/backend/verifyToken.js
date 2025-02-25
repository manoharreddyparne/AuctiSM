const jwt = require("jsonwebtoken");
const config = require("./config/config");

const verifyToken = (req, res, next) => {
  console.log("🔍 Verifying token...");

  let token = req.cookies?.authToken || req.headers["authorization"];

  if (!token) {
    console.warn("⚠️ No token found. Access denied.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // ✅ Ensure token is in "Bearer ..." format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log("🟢 Token verified successfully:", decoded);
    req.user = decoded; // Attach decoded user info
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
