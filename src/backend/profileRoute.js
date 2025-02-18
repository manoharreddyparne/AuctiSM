const express = require("express");
const verifyToken = require("./verifyToken"); // ✅ Correct import
const router = express.Router();

router.get("/api/profile", verifyToken, (req, res) => {
  res.send({ profile: req.user }); // ✅ Returns user profile after token verification
});

module.exports = router;
