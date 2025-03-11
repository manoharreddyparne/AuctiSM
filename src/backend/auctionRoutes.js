const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("./auctionModel");
const authMiddleware = require("./authMiddleware");
const { deleteImageFromS3 } = require("../utils/uploadS3");
const auctionController = require("./auctionController"); // Import updated controller

// Utility: Check if ObjectId is valid
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ✅ Create Auction (Authenticated Users Only)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 Incoming Request Body:", req.body);
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const {
      productName,
      description,
      category,
      newCategory,
      basePrice,
      startDateTime,
      endDateTime,
      imageUrls,
    } = req.body;
    if (!productName || !description || !category || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const finalCategory = category === "Other" ? newCategory : category;
    const newAuction = new Auction({
      sellerId: req.userId,
      productName,
      description,
      category: finalCategory,
      basePrice: parseFloat(basePrice),
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      registeredUsers: [],  // Stores registration details
    });
    const savedAuction = await newAuction.save();
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error("❌ Error saving auction:", error);
    res.status(500).json({ error: "Failed to save auction", details: error.message });
  }
});

// Actions created by the user (My Auctions)
router.get("/myAuctions", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const auctions = await Auction.find({ sellerId: req.userId });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions for seller:", error);
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

// All auctions in the database (other than the logged-in user's)
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const auctions = await Auction.find({ sellerId: { $ne: req.userId } });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions in /all:", error);
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

// Find auction by id
router.get("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ error: "Failed to fetch auction.", details: error.message });
  }
});

// ★ New Route: Get bid details for a specific auction ★
router.get("/:auctionId/bids", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    // Calculate current highest bid; if no bids, use basePrice.
    let currentBid = auction.basePrice;
    if (auction.bids && auction.bids.length > 0) {
      currentBid = Math.max(...auction.bids.map(bid => bid.bidAmount));
    }
    res.status(200).json({ currentBid, bids: auction.bids });
  } catch (error) {
    console.error("Error fetching bids:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

// Get registration status for an auction using registeredUsers array
router.get("/:auctionId/registration-status", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    const isRegistered = auction.registeredUsers.some(
      (reg) => reg.userId.toString() === req.userId.toString()
    );
    res.json({ isRegistered });
  } catch (error) {
    console.error("Error checking registration status:", error);
    res.status(500).json({ error: "Failed to check registration status", details: error.message });
  }
});

// Register for Auction (Delegate to auctionController.registerForAuction)
router.post("/:auctionId/register", authMiddleware, auctionController.registerForAuction);

// Place a Bid on an Auction (Delegate to auctionController.placeBid)
router.post("/:auctionId/bid", authMiddleware, auctionController.placeBid);

// Updating the Auction
router.put("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const updatedData = req.body;
    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }
    const auction = await Auction.findByIdAndUpdate(auctionId, updatedData, { new: true, runValidators: true });
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Failed to update auction.", details: error.message });
  }
});

// Deleting the Auction
router.delete("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    // Delete images from the S3 bucket if any
    if (auction.imageUrls?.length > 0) {
      await Promise.all(
        auction.imageUrls.map(async (imageUrl) => {
          try {
            await deleteImageFromS3(imageUrl);
          } catch (imgError) {
            console.error(`Error deleting image ${imageUrl} from S3:`, imgError.message);
          }
        })
      );
    }
    await Auction.findByIdAndDelete(auctionId);
    res.json({ message: "Auction deleted successfully" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({ error: "Failed to delete auction", details: error.message });
  }
});

module.exports = router;
