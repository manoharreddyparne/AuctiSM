const Auction = require("./auctionModel"); // Ensure auction model exists

// Create Auction Controller
exports.createAuction = async (req, res) => {
  try {
    console.log("🔵 Creating auction:", req.body);

    // Ensure the user is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }

    const userId = req.user.id; // Extract logged-in user's ID from JWT

    const { productName, description, category, newCategory, basePrice, startDateTime, endDateTime, imageUrls } = req.body;

    // Validate required fields
    if (!productName || !basePrice || !startDateTime || !endDateTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Create and save auction
    const auction = new Auction({
      productName,
      description,
      category,
      newCategory,
      basePrice,
      startDateTime,
      endDateTime,
      imageUrls,
      createdBy: userId, // Associate the auction with the logged-in user
    });

    await auction.save();
    console.log("✅ Auction created successfully:", auction);
    res.status(201).json(auction);
  } catch (error) {
    console.error("❌ Error creating auction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
