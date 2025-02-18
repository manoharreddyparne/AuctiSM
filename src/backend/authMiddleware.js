const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config/config');

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error("❌ No Authorization header provided");
    return res.status(401).send({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    console.error("❌ Token not found in Authorization header");
    return res.status(401).send({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("❌ Token verification failed:", error.message);
    return res.status(401).send({ message: "Invalid or expired token" });
  }
};


module.exports = authenticate;
