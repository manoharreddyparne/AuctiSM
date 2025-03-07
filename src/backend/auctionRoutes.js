const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("./auctionModel");
const authMiddleware = require("./authMiddleware"); // Ensure auth middleware is correctly implemented

// 🔥 Create Auction Route (Requires authentication)
router.post("/create", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 Incoming Request Body:", req.body);

    // Ensure user is authenticated
    if (!req.userId) {  
      console.log("❌ Unauthorized: No user ID found in request.");
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    const userId = req.userId; // Extracted from authMiddleware
    const { productName, description, category, newCategory, basePrice, startDateTime, endDateTime, imageUrls } = req.body;

    // 🔍 Check required fields
    if (!productName || !description || !category || !basePrice || !startDateTime || !endDateTime) {
      console.log("❌ Missing required fields:", { productName, description, category, basePrice, startDateTime, endDateTime });
      return res.status(400).json({ error: "Missing required fields" });
    }

    // 🔄 Ensure category is properly assigned
    const finalCategory = category === "Other" ? newCategory : category;

    // 🔄 Ensure imageUrls is an array
    const processedImageUrls = Array.isArray(imageUrls) ? imageUrls : [];

    // 🔥 Construct auction data
    const auctionData = {
      sellerId: new mongoose.Types.ObjectId(userId), // Ensure userId is linked
      productName,
      description,
      category: finalCategory,
      basePrice: parseInt(basePrice, 10) || 0,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      imageUrls: processedImageUrls, // Ensure this is an array
    };

    console.log("✅ Processed Auction Data:", auctionData);

    // 🔄 Save auction to database
    const newAuction = new Auction(auctionData);
    const savedAuction = await newAuction.save();

    console.log("✅ Auction Saved:", savedAuction);
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error("❌ Error saving auction:", error);

    if (error.name === "ValidationError") {
      console.log("❌ Validation Error Details:", error.errors);
      return res.status(400).json({ error: "Validation Error", details: error.errors });
    }

    res.status(500).json({ error: "Failed to save auction", details: error.message });
  }
});

// GET auctions for the logged-in seller
router.get("/myAuctions", authMiddleware, async (req, res) => {
  try {
    // req.userId is provided by your authMiddleware after verifying the token
    const sellerId = req.userId;
    // Find auctions where sellerId matches the logged-in user's ID
    const auctions = await Auction.find({ sellerId: sellerId });
    res.json(auctions);
  } catch (error) {
    console.error("Error fetching auctions:", error);
    res.status(500).json({ error: "Failed to fetch auctions." });
  }
});

// GET single auction by ID (for AuctionDetail page)
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
    const auction = await Auction.findByIdAndUpdate(
      auctionId,
      updatedData,
      { new: true, runValidators: true }
    );
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    res.json(auction);
  } catch (error) {
    console.error("Error updating auction:", error);
    res.status(500).json({ error: "Failed to update auction." });
  }
});


module.exports = router;
