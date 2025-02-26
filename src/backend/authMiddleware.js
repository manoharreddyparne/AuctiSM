const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/config');

const authenticate = (req, res, next) => {
  // Try to get the token from the Authorization header first
  let token = req.headers.authorization || (req.cookies && req.cookies.authToken);

  if (!token) {
    console.error("❌ No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  // Remove 'Bearer ' prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  try {
    // Verify the token using the JWT_SECRET
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Attach the decoded user ID to the request object
    next(); // Token is valid—proceed to the next middleware/route handler
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
