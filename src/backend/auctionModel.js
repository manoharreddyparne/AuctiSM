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
    imageUrls: [{ type: String }], // Array of S3 image URLs
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", auctionSchema);
