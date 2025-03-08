const mongoose = require("mongoose");
const Auction = require("./auctionModel");

// Create Auction Controller
exports.createAuction = async (req, res) => {
  try {
    console.log("🔵 Creating auction:", req.body);

    // Ensure the user is authenticated
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = new mongoose.Types.ObjectId(req.userId); // Ensure proper ObjectId conversion

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
    });

    await auction.save();
    console.log("✅ Auction created successfully:", auction);
    res.status(201).json(auction);
  } catch (error) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ message: "Internal server error", details: error.message });
  }
};

// 🛠 FIXED: Fetch all auctions, excluding the logged-in user's auctions
exports.getAllAuctions = async (req, res) => {
  try {
    console.log("🔍 Fetching auctions for user:", req.userId);

    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = new mongoose.Types.ObjectId(req.userId);

    // Exclude auctions where the sellerId is the logged-in user
    const auctions = await Auction.find({ sellerId: { $ne: userId } });

    if (!auctions.length) {
      return res.status(404).json({ message: "No auctions available." });
    }

    console.log("✅ Auctions fetched successfully:", auctions.length);
    res.json({ auctions });
  } catch (error) {
    console.error("❌ Error fetching auctions:", error.message);
    res.status(500).json({ message: "Failed to fetch auction.", details: error.message });
  }
};
