const express = require("express");
const { register, login } = require("./authController");
const authenticate = require("./authMiddleware");

const router = express.Router();

// Public Routes
router.post("/signup", register);  // Removed `/api/` prefix
router.post("/login", login);

// Protected Route
router.get("/profile", authenticate, (req, res) => {
  res.send({ message: `Welcome user ${req.userId}` });
});

module.exports = router;
