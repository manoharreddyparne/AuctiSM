const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/config');

const authenticate = (req, res, next) => {
  let token = req.headers.authorization; // Try getting token from Authorization header

  if (!token) {
    // If no token in Authorization header, try cookies
    token = req.cookies.authToken; 
  }

  if (!token) {
    console.error("❌ No token provided");
    return res.status(401).send({ message: "No token provided" });
  }

  // Ensure the token starts with "Bearer " if it's in Authorization header
  if (token.startsWith('Bearer ')) {
    token = token.slice(7, token.length);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId; // Set the decoded user ID to the request
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).send({ message: "Invalid or expired token" });
  }
};

module.exports = authenticate;
