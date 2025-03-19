const mongoose = require("mongoose");
const Auction = require("./auctionModel");

// Create Auction
exports.createAuction = async (req, res) => {
  try {
    console.log("🔵 Creating auction:");
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);
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
      registeredUsers: [],
      participants: [],
      bids: [],
    });

    await auction.save();
    console.log("✅ Auction created successfully:", auction);
    res.status(201).json(auction);
  } catch (error) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// Get All Auctions (for non-sellers)
exports.getAllAuctions = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }
    const userId = new mongoose.Types.ObjectId(req.userId);
    const auctions = await Auction.find({ sellerId: { $ne: userId } }).sort({ startDateTime: 1 });
    
    if (!auctions.length) {
      return res.status(404).json({ message: "No auctions available." });
    }
    res.json(auctions);
  } catch (error) {
    console.error("❌ Error fetching auctions:", error.message);
    res.status(500).json({ message: "Failed to fetch auctions", details: error.message });
  }
};

// Register for Auction
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

    if (new Date() > new Date(auction.startDateTime)) {
      return res.status(400).json({ message: "Auction has already started. Registration is closed." });
    }

    const alreadyRegistered = auction.registeredUsers.some(reg => reg.userId.toString() === userId.toString());
    if (alreadyRegistered) {
      return res.status(400).json({ message: "User is already registered for this auction" });
    }

    const { fullName, email, mobileNumber, paymentDetails, additionalInfo } = req.body;
    if (!fullName || !email || !mobileNumber || !paymentDetails) {
      return res.status(400).json({ message: "Missing required registration details" });
    }

    auction.registeredUsers.push({
      userId,
      fullName,
      email,
      mobileNumber,
      paymentDetails,
      additionalInfo,
    });

    if (!auction.participants.includes(userId)) {
      auction.participants.push(userId);
    }

    await auction.save();

    res.status(200).json({
      message: "Successfully registered for the auction",
      registeredUsers: auction.registeredUsers,
    });
  } catch (error) {
    console.error("❌ Error registering for auction:", error.message);
    res.status(500).json({ message: "Failed to register for the auction", details: error.message });
  }
};

// Get All Participants for an Auction
exports.getAuctionParticipants = async (req, res) => {
  try {
    const auctionId = req.params.auctionId;
    const auction = await Auction.findById(auctionId).populate("registeredUsers.userId", "fullName email");
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }
    
    if (!auction.registeredUsers.length) {
      return res.status(404).json({ message: "No participants found for this auction" });
    }
    
    res.status(200).json({ participants: auction.registeredUsers });
  } catch (error) {
    console.error("❌ Error fetching participants:", error.message);
    res.status(500).json({ message: "Failed to fetch participants", details: error.message });
  }
};

// Place a Bid on an Auction
exports.placeBid = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const auctionId = req.params.auctionId;
    const userId = new mongoose.Types.ObjectId(req.userId);
    const { bidAmount } = req.body;
    const bidValue = parseFloat(bidAmount);

    if (isNaN(bidValue) || bidValue <= 0) {
      return res.status(400).json({ message: "Invalid bid amount" });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const isRegistered = auction.registeredUsers.some(reg => reg.userId.toString() === userId.toString());
    if (!isRegistered) {
      return res.status(403).json({ message: "You are not registered for this auction" });
    }

    const now = new Date();
    if (now < new Date(auction.startDateTime) || now > new Date(auction.endDateTime)) {
      return res.status(400).json({ message: "Auction is not active" });
    }

    let currentHighest = auction.basePrice;
    if (auction.bids.length > 0) {
      currentHighest = Math.max(...auction.bids.map(bid => bid.bidAmount));
    }

    if (bidValue <= currentHighest) {
      return res.status(400).json({ message: "Bid must be higher than the current highest bid" });
    }

    const existingBidIndex = auction.bids.findIndex(bid => bid.bidderId.toString() === userId.toString());
    if (existingBidIndex > -1) {
      if (auction.bids[existingBidIndex].bidAmount === currentHighest) {
        return res.status(400).json({ message: "Your current bid is already the highest" });
      } else {
        auction.bids[existingBidIndex].bidAmount = bidValue;
        auction.bids[existingBidIndex].bidTime = now;
      }
    } else {
      auction.bids.push({
        bidderId: userId,
        bidAmount: bidValue,
        bidTime: now,
      });
    }

    await auction.save();

    res.status(200).json({ message: "Bid placed successfully", auction });
  } catch (error) {
    console.error("❌ Error placing bid:", error);
    res.status(500).json({ message: "Server error while placing bid", details: error.message });
  }
};
