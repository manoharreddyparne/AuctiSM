const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Auction = require("./auctionModel");
const authMiddleware = require("./authMiddleware");
const { deleteImageFromS3 } = require("../utils/uploadS3");

//function checking the vaildity of the object id
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
      registeredUsers: [],
    });

    const savedAuction = await newAuction.save();
    res.status(201).json(savedAuction);
  } catch (error) {
    console.error("❌ Error saving auction:", error);
    res.status(500).json({ error: "Failed to save auction", details: error.message });
  }
});

// actions created by the user
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

//all auctions in the database other than the logged in user created
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
//finding auction by id
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
//status of the registration.
router.get("/:auctionId/registration-status", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    if (!isValidObjectId(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    const userId = req.userId;
    const isRegistered = auction.registeredUsers.some(
      (user) => user.userId.toString() === userId
    );
    res.json({ isRegistered });
  } catch (error) {
    console.error("Error checking registration status:", error);
    res.status(500).json({ error: "Failed to check registration status", details: error.message });
  }
});

//preventing the duplicate registration
router.post("/:auctionId/register", authMiddleware, async (req, res) => {
  try {
    const { auctionId } = req.params;
    const { fullName, email, mobileNumber, paymentDetails, additionalInfo } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: No user ID found" });
    }

    if (!fullName || !email || !mobileNumber || !paymentDetails) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(auctionId)) {
      return res.status(400).json({ error: "Invalid auction ID format" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ error: "Auction not found" });
    }
    const isAlreadyRegistered = auction.registeredUsers.some(
      (user) => user.userId.toString() === userId
    );
    if (isAlreadyRegistered) {
      return res.status(400).json({ error: "You are already registered for this auction." });
    }
//pushing the user details to the registered users array
    auction.registeredUsers.push({ userId, fullName, email, mobileNumber, paymentDetails, additionalInfo });

    if (!auction.participants.some((id) => id.toString() === userId)) {
      auction.participants.push(userId);
    }

    await auction.save();

    res.json({ message: "Successfully registered for the auction!" });
  } catch (error) {
    console.error("Error registering for auction:", error);
    res.status(500).json({ error: "Failed to register for the auction", details: error.message });
  }
});


// updating the auction
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

//deleting the auction
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
//deleting the images from the s3 bucket
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
