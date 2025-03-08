const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    newCategory: { type: String, default: null }, // Only used if category is "Other"
    basePrice: { type: Number, required: true, min: 0 }, // Ensure base price is non-negative
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    imageUrls: { type: [String], default: [] }, // Defaults to an empty array
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Ensures reference to User model
  },
  { timestamps: true }
);

// ✅ Add an index for faster queries
auctionSchema.index({ sellerId: 1, startDateTime: 1 });

module.exports = mongoose.model("Auction", auctionSchema);
