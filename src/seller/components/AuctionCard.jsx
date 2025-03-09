
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./AuctionCard.css";

const AuctionCard = ({ auction, darkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openModal = (index = 0) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % auction.imageUrls.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      (prev - 1 + auction.imageUrls.length) % auction.imageUrls.length
    );
  };

  return (
    <Link to={`/mainpage/my-auctions/${auction._id}`} className="auction-card-link">
      <div className={`auction-card ${darkMode ? "dark" : ""}`}>
        <div className="auction-image" onClick={() => openModal(0)}>
          <img
            src={auction.imageUrls[0]}
            alt={`${auction.productName} - main view`}
          />
        </div>
        <div className="auction-details">
          <h3>{auction.productName}</h3>
          <p>{auction.description.substring(0, 100)}...</p>
          <p className="price">Base Price: ₹{auction.basePrice}</p>
        </div>

        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>
              <button className="prev-btn" onClick={prevImage}>
                ‹
              </button>
              <img
                src={auction.imageUrls[currentImageIndex]}
                alt={`${auction.productName} - view ${currentImageIndex + 1}`}
                className="modal-image"
              />
              <button className="next-btn" onClick={nextImage}>
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default AuctionCard;
