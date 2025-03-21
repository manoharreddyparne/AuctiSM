const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
  //debug
  //console.log("🔍 Verifying token...");

  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    console.warn(" No token found. Access denied.");
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7).trim() : tokenHeader;
  //debug
  //console.log("🔹 Extracted Token:", token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    //debug
    //console.log(" Token verified successfully:", decoded);

    req.user = decoded;
    req.userId = decoded.userId || decoded.id;

    if (!req.userId) {
      console.error(" Token missing userId.");
      return res.status(401).json({ error: "Invalid token data." });
    }
    //debug
    //console.log(" Attached userId:", req.userId);
    next();
  } catch (error) {
    console.error(" Token verification failed:", error.message);

    return res.status(401).json({
      error:
        error.name === "TokenExpiredError"
          ? "Token expired, please log in again."
          : "Invalid or expired token.",
    });
  }
};

module.exports = verifyToken;
