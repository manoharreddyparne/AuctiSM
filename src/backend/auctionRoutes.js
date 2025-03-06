const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Auction = require("./auctionModel");

// POST route to create an auction
router.post("/create", async (req, res) => {
  try {
    console.log("🔥 Incoming Request Body:", req.body); // Log incoming data
    
    const {
      productName,
      description,
      category,
      newCategory,
      basePrice,
      startDateTime,
      endDateTime,
      imageUrls,
      createdBy
    } = req.body;

    // Check for required fields
    if (!productName || !description || !category || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const auctionData = {
      productName,
      description,
      category,
      newCategory,
      basePrice,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      imageUrls: imageUrls || [],
      createdBy: createdBy ? new mongoose.Types.ObjectId(createdBy) : new mongoose.Types.ObjectId("640000000000000000000000")
    };

    console.log("✅ Processed Auction Data:", auctionData); // Log processed data

    const newAuction = new Auction(auctionData);
    const savedAuction = await newAuction.save();

    console.log("✅ Auction Saved:", savedAuction);
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error("❌ Error saving auction:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Validation Error", details: error.errors });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ error: "Invalid data format", details: error.message });
    }

    res.status(500).json({ error: "Failed to save auction", details: error.message });
  }
});

module.exports = router;
