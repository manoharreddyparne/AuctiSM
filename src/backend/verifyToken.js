const jwt = require("jsonwebtoken");
const config = require("./config/config");

const verifyToken = (req, res, next) => {
  console.log("🔍 Verifying token...");

  // Try to get token from cookies first, then from Authorization header
  let token = req.cookies && req.cookies.authToken ? req.cookies.authToken : req.headers["authorization"];
  console.log("Received token:", token);

  if (!token) {
    console.warn("⚠️ No token found. Access denied.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  // If the token is in the Authorization header, it may include the "Bearer " prefix
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
    console.log("Token format verified as Bearer.");
  } else {
    console.warn("⚠️ Token format is not 'Bearer <token>', proceeding with token as provided.");
  }

  try {
    // Verify the token using the secret from your config
    const decoded = jwt.verify(token, config.JWT_SECRET);
    console.log("🟢 Token verified successfully:", decoded);

    // Attach the decoded user data to the request object for downstream use
    req.user = decoded;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
