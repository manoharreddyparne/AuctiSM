import React from "react";
import "../css/AuctionCard.css"; 

function AuctionCard({ auction }) {

  if (!auction || !auction.image || !auction.title || !auction.basePrice) {
    return <div className="auction-card-error">No preview found</div>;
  }

  return (
    <div className="auction-card">
      <img
        src={auction.image}
        alt={auction.title}
        className="auction-image"
        // If image is missing, show a default image (optional)
        onError={(e) => e.target.src = "https://support.heberjahiz.com/hc/article_attachments/21013076295570"}
      />
      <h3 className="auction-title">{auction.title}</h3>
      <p className="auction-price">Starting Price: ${auction.basePrice}</p>
    </div>
  );
}

export default AuctionCard;
