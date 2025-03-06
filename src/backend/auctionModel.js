const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    newCategory: { type: String },
    basePrice: { type: Number, required: true },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    imageUrls: { type: [String], default: [] }, // Ensure it defaults to an array
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 🔥 Changed from `createdBy` to `sellerId`
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
