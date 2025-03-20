import React, { useEffect } from "react";
import "../css/AuctionCard.css";

const AuctionCard = ({ auction, onCardClick, isDarkMode }) => {
  useEffect(() => {

  }, [isDarkMode, auction]);

  const imageSrc =
    auction.imageUrls && auction.imageUrls.length > 0
      ? auction.imageUrls[0]
      : "https://via.placeholder.com/300x200?text=No+Image";

  const title = auction.productName || "Untitled Auction";
  const basePrice = auction.basePrice !== undefined ? auction.basePrice : "N/A";

  return (
    <div
      className={`auction-card ${isDarkMode ? "dark-mode" : ""}`}
      onClick={() => onCardClick(auction.id)}
    >

      <div className="auction-image-container">
        <img
          src={imageSrc}
          alt={`${title} - main view`}
          className="auction-image"
          onError={(e) =>
            (e.target.src =
              "https://via.placeholder.com/300x200?text=No+Image")
          }
        />
      </div>

      <div className="auction-details">
        <h3 className="auction-title">{title}</h3>
        <p className="auction-price">Base Price: ₹{basePrice}</p>
      </div>
    </div>
  );
};

export default AuctionCard;
