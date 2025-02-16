import React from "react";
import "./AuctionCard.css"; // Import the CSS file

function AuctionCard({ auction }) {
  return (
    <div className="auction-card">
      <img src={auction.image} alt={auction.title} className="auction-image" />
      <h3 className="auction-title">{auction.title}</h3>
      <p className="auction-price">Starting Price: ${auction.basePrice}</p>
    </div>
  );
}

export default AuctionCard;
