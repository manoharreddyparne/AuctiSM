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

    const userId = new mongoose.Types.ObjectId(req.userId); // Ensure it's an ObjectId

    const { productName, description, category, newCategory, basePrice, startDateTime, endDateTime, imageUrls } = req.body;

    if (!productName || !description || !category || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const finalCategory = category === "Other" ? newCategory : category;
    const processedImageUrls = Array.isArray(imageUrls) ? imageUrls : [];

    const auctionData = {
      sellerId: userId,
      productName,
      description,
      category: finalCategory,
      basePrice: parseFloat(basePrice), // Use parseFloat for decimals
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
    const sellerId = new mongoose.Types.ObjectId(req.userId); // Convert to ObjectId
    const auctions = await Auction.find({ sellerId: sellerId });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions for seller:", error);
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

// GET all auctions except those created by the logged-in user
router.get("/all", authMiddleware, async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }
    
    let userId;
    try {
      userId = new mongoose.Types.ObjectId(req.userId);
    } catch (conversionError) {
      console.error("Error converting userId to ObjectId:", conversionError);
      return res.status(400).json({ error: "Invalid user ID format.", details: conversionError.message });
    }
    
    console.log("GET /all - Logged-in userId:", userId.toString());

    // Fetch all auctions
    const allAuctions = await Auction.find();
    console.log("GET /all - Total auctions fetched:", allAuctions.length);

    // Filter out auctions created by the logged-in user
    const filteredAuctions = allAuctions.filter(auction => {
      if (!auction.sellerId) return true;
      return auction.sellerId.toString() !== userId.toString();
    });
    
    console.log("GET /all - Auctions after filtering:", filteredAuctions.length);
    res.json(filteredAuctions);
  } catch (error) {
    console.error("Error fetching auctions in /all:", error);
    res.status(500).json({ error: "Failed to fetch auctions.", details: error.message });
  }
});

// GET single auction by ID (removed regex constraint)
router.get("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    console.error("Error fetching auction:", error);
    res.status(500).json({ error: "Failed to fetch auction.", details: error.message });
  }
});

// PUT route to update an auction (removed regex constraint)
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
    res.status(500).json({ error: "Failed to update auction.", details: error.message });
  }
});

// DELETE route to delete an auction and remove its images from S3 (removed regex constraint)
router.delete("/:auctionId", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }

    // Delete images from S3 (handle errors individually)
    if (auction.imageUrls && auction.imageUrls.length > 0) {
      for (const imageUrl of auction.imageUrls) {
        try {
          await deleteImageFromS3(imageUrl);
        } catch (imgError) {
          console.error(`Error deleting image ${imageUrl} from S3:`, imgError.message);
        }
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
