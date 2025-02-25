const jwt = require("jsonwebtoken");
const config = require("./config/config");

const verifyToken = (req, res, next) => {
  console.log("🔍 Verifying token...");

  // Get token from cookies or authorization header
  let token = req.cookies?.authToken || req.headers["authorization"];
  console.log("Received token:", token);

  // If no token found, deny access
  if (!token) {
    console.warn("⚠️ No token found. Access denied.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // Ensure token is in "Bearer ..." format
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
    console.log("Token format verified as Bearer.");
  } else {
    console.warn("⚠️ Token format is incorrect. Expected 'Bearer <token>' or from cookies.");
  }

  try {
    // Verify token using the JWT_SECRET
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log("🟢 Token verified successfully:", decoded);

    // Attach the decoded user info to the request object
    req.user = decoded; // Attach the decoded user data to the request object
    next(); // Move to the next middleware or route handler
  } catch (error) {
    // If token verification fails, return an error response
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
