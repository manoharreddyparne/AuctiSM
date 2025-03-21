const jwt = require("jsonwebtoken");
const User = require("./userModel");
require("dotenv").config();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      //debug
      // console.error(" No token provided");
      return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    if (!process.env.JWT_SECRET) {

      //debug 
      // console.error(" JWT_SECRET is missing in environment variables!");
      return res.status(500).json({ error: "Internal server error: Missing JWT secret" });
    }


    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded) {
      //debug
      //console.log("Token decoded for userId:", decoded.userId || decoded._id);
    }
    const userId = decoded.userId || decoded._id;
    if (!userId) {
      //debug
      //console.error(" No userId found in token payload.");
      return res.status(401).json({ error: "Unauthorized: Invalid token data" });
    }
    const user = await User.findById(userId);
    if (!user) {
      //debug
      //console.error(" User not found for token userId:", userId);
      return res.status(401).json({ error: "Unauthorized: Invalid user" });
    }
    req.userId = userId.toString();
    //debug
    //console.log("Middleware Authenticated User ID:", req.userId);

    next(); 
  } catch (error) {
    console.error(" Token verification failed:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Unauthorized: Token expired" });
    }

    return res.status(401).json({ error: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = authenticate;
