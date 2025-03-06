const Auction = require("./auctionModel"); // Ensure auction model exists

// Create Auction Controller
exports.createAuction = async (req, res) => {
  try {
    console.log("🔵 Creating auction:", req.body);

    const { title, description, startingBid, endDate } = req.body;

    if (!title || !startingBid || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const auction = new Auction({
      title,
      description,
      startingBid,
      endDate,
      createdBy: req.userId, // Ensure user is authenticated
    });

    await auction.save();
    console.log("✅ Auction created successfully:", auction);
    res.status(201).json(auction);
  } catch (error) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
