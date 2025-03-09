const express = require("express");
const http = require("http"); 
const { Server } = require("socket.io"); 
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");

dotenv.config();

const config = require("./config/config");
const routes = require("./routes");
const profileRoute = require("./profileRoute");
const User = require("./userModel");
const authenticate = require("./authMiddleware");
const authController = require("./authController");
const auctionRoutes = require("./auctionRoutes");
const awsRoutes = require("./awsRoutes");
const Auction = require("./auctionModel");

const app = express();
// Create an HTTP server
const server = http.createServer(app);

// Middleware Setup

app.use(morgan("dev")); // Request logging for debugging
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000" || process.env.REACT_APP_CLIENT,
  "https://auctism-frontend.onrender.com", 

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: process.env.REACT_APP_CLIENT,
    credentials: true,
  },
});


io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

// Handle joining an auction room
  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });
// Handle leaving an auction room
  socket.on("placeBid", async (data) => {
    try {
      const { auctionId, userId, bidAmount } = data;
      // Find the auction by ID
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return socket.emit("bidError", { message: "Auction not found" });
      }

      auction.bids = auction.bids || [];
      auction.bids.push({ bidderId: userId, bidAmount, bidTime: new Date() });
      await auction.save();

      // Broadcast the new bid to all clients in this auction room
      io.to(auctionId).emit("bidUpdate", { auctionId, bidAmount, userId });
      console.log(`Bid placed in auction ${auctionId} by ${userId}: ${bidAmount}`);
    } catch (error) {
      console.error("❌ Error placing bid:", error);
      socket.emit("bidError", { message: "Server error placing bid" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// ------------------
// API Routes
// ------------------
app.use("/api/aws", awsRoutes);
app.use("/api/auctions", auctionRoutes);
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

// ------------------
// Authentication Routes
// ------------------
app.post("/api/google-login", authController.googleLogin);

app.post("/api/reset-password", authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();
    console.log("  Password reset successful for:", user.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/set-password", authenticate, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ message: "Invalid email or weak password (min 6 chars)" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.authProvider !== "google") {
      return res.status(400).json({ message: "Only Google login users can set a password" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();
    console.log("  Password set successfully for Google user:", user.email);
    res.status(200).json({ message: "Password set successfully. You can now log in manually." });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ------------------
// Test Route
// ------------------
app.get("/", (req, res) => {
  res.send(" AuctiSM Backend is running");
});

// ------------------
// Debug Middleware (Logs Incoming Requests)
// ------------------
app.use((req, res, next) => {
  console.log("🔵 Incoming Request:", req.method, req.url);
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", req.body);
  next();
});

// ------------------
// Database Connection & Server Start
// ------------------
mongoose
  .connect(config.MONGO_URI)
  .then(() => {
    console.log("  Connected to MongoDB");

    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

module.exports = { app, io };
