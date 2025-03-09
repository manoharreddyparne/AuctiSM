const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
  bidderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bidAmount: { type: Number, required: true },
  bidTime: { type: Date, default: Date.now }
});

const auctionSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    newCategory: { type: String, default: null },
    basePrice: { type: Number, required: true, min: 0 },
    startDateTime: { type: Date, required: true },
    endDateTime: { type: Date, required: true },
    imageUrls: { type: [String], default: [] },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    registeredUsers: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        paymentDetails: { type: String, required: true },
        additionalInfo: { type: String },
      },
    ],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

    bids: [bidSchema],
  },
  { timestamps: true }
);

auctionSchema.index({ sellerId: 1, startDateTime: 1 });

module.exports = mongoose.model("Auction", auctionSchema);
