const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./config/config");

const authenticate = (req, res, next) => {
  let token = req.headers.authorization;
  console.log("🔍 Incoming token:", token); // ✅ Log received token

  if (!token) {
    console.error("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  console.log("🛠️ Token after trimming:", token); // ✅ Log cleaned token

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token decoded:", decoded); // ✅ Log decoded token
    req.userId = decoded.userId;

    if (!req.userId) {
      console.error("❌ No userId found in token.");
      return res.status(401).json({ message: "Unauthorized: Invalid token data" });
    }

    console.log("🟢 Middleware Authenticated User ID:", req.userId);
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
