const mongoose = require("mongoose");
const Auction = require("./auctionModel");
//auction is created below
exports.createAuction = async (req, res) => {
  try {
    console.log("🔵 Creating auction:" );//, req.body);

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    const { productName, description, category, newCategory, basePrice, startDateTime, endDateTime, imageUrls } = req.body;

    if (!productName || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalCategory = category === "Other" ? newCategory : category;

    const auction = new Auction({
      productName,
      description,
      category: finalCategory,
      basePrice: parseFloat(basePrice),
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      imageUrls: Array.isArray(imageUrls) ? imageUrls : [],
      sellerId: userId,
      participants: [], 
    });

    await auction.save();
    console.log("✅ Auction created successfully:", auction);
    res.status(201).json(auction);
  } catch (error) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

//fetching all auctions
exports.getAllAuctions = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
    const auctions = await Auction.find({ sellerId: { $ne: userId } });

    if (!auctions.length) {
      return res.status(404).json({ message: "No auctions available." });
    }

    res.json({ auctions });
  } catch (error) {
    console.error("❌ Error fetching auctions:", error.message);
    res.status(500).json({ message: "Failed to fetch auctions", details: error.message });
  }
};

//registering for auction
exports.registerForAuction = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const auctionId = req.params.auctionId;
    const userId = new mongoose.Types.ObjectId(req.userId);

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.participants.includes(userId)) {
      return res.status(400).json({ message: "User is already registered for this auction" });
    }

    auction.participants.push(userId);
    await auction.save();

    res.status(200).json({ message: "Successfully registered for the auction" });

  } catch (error) {
    console.error("❌ Error registering for auction:", error.message);
    res.status(500).json({ message: "Failed to register for the auction", details: error.message });
  }
};

//getting all participants
exports.getAuctionParticipants = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const auction = await Auction.findById(auctionId).populate("participants", "fullName email");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    res.status(200).json({ participants: auction.participants });

  } catch (error) {
    console.error("❌ Error fetching participants:", error.message);
    res.status(500).json({ message: "Failed to fetch participants", details: error.message });
  }
};
