const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const moment = require("moment-timezone");
const Auction = require("./auctionModel");
const authMiddleware = require("./authMiddleware");
const { deleteImageFromS3 } = require("../utils/uploadS3");
const auctionController = require("./auctionController");
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

router.get("/public", async (req, res) => {
  try {
    const auctions = await Auction.find({});
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

router.post("/create", authMiddleware, async (req, res) => {
  try {
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
      timeZone
    } = req.body;
    if (!productName || !description || !category || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const finalCategory = category === "Other" ? newCategory : category;
    const tz = timeZone || "Asia/Kolkata";
    const startUTC = moment.tz(startDateTime, "DD-MM-YYYY HH:mm", tz).toDate();
    const endUTC = moment.tz(endDateTime, "DD-MM-YYYY HH:mm", tz).toDate();
    const newAuction = new Auction({
      sellerId: req.userId,
      productName,
      description,
      category: finalCategory,
      basePrice: parseFloat(basePrice),
      startDateTime: startUTC,
      endDateTime: endUTC,
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      registeredUsers: []
    });
    const savedAuction = await newAuction.save();
    res.status(201).json(savedAuction);
  } catch (error) {
    res.status(500).json({ error: "Failed to save auction", details: error.message });
  }
});

router.get("/myAuctions", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    const auctions = await Auction.find({ sellerId: req.userId });
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

router.get("/all", authMiddleware, async (req, res) => {
  try {
    const auctions = await Auction.find({});
    res.json(auctions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

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
    res.status(500).json({ error: "Failed to fetch auction.", details: error.message });
  }
});

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
    let currentBid = auction.basePrice;
    if (auction.bids && auction.bids.length > 0) {
      currentBid = Math.max(...auction.bids.map(bid => bid.bidAmount));
    }
    res.status(200).json({ currentBid, bids: auction.bids });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

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
    res.status(500).json({ error: "Failed to check registration status", details: error.message });
  }
});

router.post("/:auctionId/register", authMiddleware, auctionController.registerForAuction);

router.post("/:auctionId/bid", authMiddleware, auctionController.placeBid);

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
    if (updatedData.startDateTime && /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(updatedData.startDateTime)) {
      const tz = updatedData.timeZone || "Asia/Kolkata";
      updatedData.startDateTime = moment.tz(updatedData.startDateTime, "DD-MM-YYYY HH:mm", tz).toDate();
    }
    if (updatedData.endDateTime && /^\d{2}-\d{2}-\d{4} \d{2}:\d{2}$/.test(updatedData.endDateTime)) {
      const tz = updatedData.timeZone || "Asia/Kolkata";
      updatedData.endDateTime = moment.tz(updatedData.endDateTime, "DD-MM-YYYY HH:mm", tz).toDate();
    }
    const auction = await Auction.findByIdAndUpdate(auctionId, updatedData, { new: true, runValidators: true });
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    res.status(500).json({ error: "Failed to update auction.", details: error.message });
  }
});

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
    res.status(500).json({ error: "Failed to delete auction", details: error.message });
  }
});

module.exports = router;
