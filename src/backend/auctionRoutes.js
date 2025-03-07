const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("./auctionModel");
const authMiddleware = require("./authMiddleware");
const { deleteImageFromS3 } = require("../utils/uploadS3"); // Import S3 deletion function

// 🔥 Create Auction Route (Requires authentication)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 Incoming Request Body:", req.body);

    if (!req.userId) {  
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    const userId = req.userId;
    const { productName, description, category, newCategory, basePrice, startDateTime, endDateTime, imageUrls } = req.body;

    if (!productName || !description || !category || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const finalCategory = category === "Other" ? newCategory : category;
    const processedImageUrls = Array.isArray(imageUrls) ? imageUrls : [];

    const auctionData = {
      sellerId: new mongoose.Types.ObjectId(userId),
      productName,
      description,
      category: finalCategory,
      basePrice: parseInt(basePrice, 10) || 0,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      imageUrls: processedImageUrls,
    };

    const newAuction = new Auction(auctionData);
    const savedAuction = await newAuction.save();
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error("❌ Error saving auction:", error);
    res.status(500).json({ error: "Failed to save auction", details: error.message });
  }
});

// GET auctions for the logged-in seller
router.get("/myAuctions", authMiddleware, async (req, res) => {
  try {
    const sellerId = req.userId;
    const auctions = await Auction.find({ sellerId: sellerId });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Failed to fetch auctions." });
  }
});

// GET single auction by ID
router.get("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ error: "Failed to fetch auction." });
  }
});

// PUT route to update an auction
router.put("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const updatedData = req.body;
    const auction = await Auction.findByIdAndUpdate(auctionId, updatedData, { new: true, runValidators: true });
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Failed to update auction." });
  }
});

// DELETE route to delete an auction and remove its images from S3
router.delete("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Delete images from S3
    if (auction.imageUrls && auction.imageUrls.length > 0) {
      for (const imageUrl of auction.imageUrls) {
        await deleteImageFromS3(imageUrl);
      }
    }

    // Delete auction from database
    await Auction.findByIdAndDelete(auctionId);
    res.json({ message: "Auction deleted successfully" });
  } catch (error) {
    console.error("Error deleting auction:", error);
    res.status(500).json({ error: "Failed to delete auction", details: error.message });
  }
});

module.exports = router;
