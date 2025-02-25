const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");

dotenv.config();

const config = require("./config/config");
const routes = require("./routes");
const profileRoute = require("./profileRoute");

const app = express();

// ✅ Middleware
app.use(morgan("dev")); // Logs requests for debugging
app.use(cookieParser());
app.use(express.json());

// ✅ Debugging Request Headers
app.use((req, res, next) => {
  console.log("🔵 Incoming Request:", req.method, req.url);
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", req.body);
  next();
});

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// ✅ Routes
app.use("/api", routes);
app.use(
  "/api/profile",
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  },
  profileRoute
);

// ✅ Test route
app.get("/", (req, res) => {
  res.send("AuctiSM Backend is running");
});

// ✅ Database Connection
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");

    // ✅ Start Server Only After DB Connects
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit on DB failure
  });
