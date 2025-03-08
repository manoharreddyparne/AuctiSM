const jwt = require("jsonwebtoken");
const config = require("./config/config");

const verifyToken = (req, res, next) => {
  console.log("🔍 Verifying token...");

  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies?.authToken || req.headers["authorization"];
  console.log("Received token:", token || "No token found ❌");

  if (!token) {
    console.warn("⚠️ No token found. Access denied.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Ensure token has "Bearer " prefix before slicing
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
    console.log("Token format verified as Bearer.");
  }

  // Debug JWT_SECRET to check if it's set properly
  console.log("🔑 Using JWT_SECRET:", config.JWT_SECRET ? "Exists ✅" : "MISSING ❌");

  try {
    // Verify the token using the secret from your config
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log("🟢 Token verified successfully:", decoded);

    // Attach the decoded user data to the request object
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      console.error("❌ Token has expired");
      return res.status(401).json({ error: "Token expired, please log in again." });
    } else if (error.name === "JsonWebTokenError") {
      console.error("❌ Invalid token:", error.message);
      return res.status(401).json({ error: "Invalid token." });
    } else {
      console.error("❌ Unknown token error:", error.message);
      return res.status(401).json({ error: "Authentication error." });
    }
  }
};

module.exports = verifyToken;
