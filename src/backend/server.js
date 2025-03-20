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
const server = http.createServer(app);
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());

const allowedOrigins = [
  process.env.REACT_APP_CLIENT || "http://localhost:3000",
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

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔵 User connected:", socket.id);

  socket.on("joinAuction", (auctionId) => {
    socket.join(auctionId);
    console.log(`Socket ${socket.id} joined auction ${auctionId}`);
  });

  socket.on("placeBid", async (data) => {
    try {
      const { auctionId, userId, bidAmount } = data;
      const auction = await Auction.findById(auctionId);
      if (!auction) {
        return socket.emit("bidError", { code: "AUCTION_NOT_FOUND", message: "Auction not found" });
      }
      const user = await User.findById(userId);
      if (!user || !user.registeredAuctions.includes(auctionId)) {
        return socket.emit("bidError", { code: "USER_NOT_REGISTERED", message: "User not registered for this auction" });
      }
      auction.bids = auction.bids || [];
      auction.bids.push({ bidderId: userId, bidAmount, bidTime: new Date() });
      await auction.save();
      io.to(auctionId).emit("bidUpdate", { auctionId, bidAmount, userId });
      console.log(`Bid placed in auction ${auctionId} by ${userId}: ${bidAmount}`);
    } catch (error) {
      console.error("❌ Error placing bid:", error);
      socket.emit("bidError", { code: "SERVER_ERROR", message: "Server error placing bid" });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

app.use("/api/aws", awsRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api", routes);
app.use(
  "/api/profile",
  authenticate,
  (req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  },
  profileRoute
);

app.post("/api/google-login", authController.googleLogin);

app.post("/api/reset-password", authenticate, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ code: "WEAK_PASSWORD", message: "Password must be at least 6 characters long" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();
    console.log("Password reset successful for:", user.email);
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("❌ Error resetting password:", error);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
});

app.post("/api/set-password", authenticate, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ code: "INVALID_INPUT", message: "Invalid email or weak password (min 6 chars)" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    if (user.authProvider !== "google") {
      return res.status(400).json({ code: "INVALID_AUTH_PROVIDER", message: "Only Google login users can set a password" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.authProvider = "manual";
    user.needsPassword = false;
    await user.save();
    console.log("Password set successfully for Google user:", user.email);
    res.status(200).json({ message: "Password set successfully. You can now log in manually." });
  } catch (error) {
    console.error("❌ Error setting password:", error);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error" });
  }
});

app.post("/api/register-for-auction", authenticate, async (req, res) => {
  try {
    const { auctionId } = req.body;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ code: "USER_NOT_FOUND", message: "User not found" });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ code: "AUCTION_NOT_FOUND", message: "Auction not found" });
    }
    if (user.registeredAuctions.includes(auctionId)) {
      return res.status(400).json({ code: "USER_ALREADY_REGISTERED", message: "User is already registered for this auction" });
    }
    user.registeredAuctions.push(auctionId);
    await user.save();
    res.status(200).json({ message: "User successfully registered for the auction" });
  } catch (error) {
    console.error("❌ Error registering for auction:", error);
    res.status(500).json({ code: "SERVER_ERROR", message: "Server error registering for auction" });
  }
});

app.get("/", (req, res) => {
  res.send("AuctiSM Backend is running");
});

app.use((req, res, next) => {
  console.log("🔵 Incoming Request:", req.method, req.url);
  console.log("🔹 Headers:", req.headers);
  console.log("🔹 Body:", req.body);
  next();
});

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
    console.log("MongoDB URI:", config.MONGO_URI ? "✅ Available" : "❌ Not Set");
    process.exit(1);
  });

module.exports = { app, io };
