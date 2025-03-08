import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./AuctionDetailParticipant.css";

function AuctionDetailParticipant() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  const darkMode = localStorage.getItem("darkMode") === "enabled";

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchAuction = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found. Please log in.");
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auctions/${auctionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAuction(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch auction details.");
      }
    };

    fetchAuction();
  }, [auctionId, API_BASE_URL]);

  // ✅ Memoized countdown timer function
  const updateTimeRemaining = useCallback(() => {
    if (!auction) return;

    const now = new Date().getTime();
    const startTime = new Date(auction.startDateTime).getTime();
    const endTime = new Date(auction.endDateTime).getTime();

    if (now < startTime) {
      setTimeRemaining(`Starts in: ${formatTime(startTime - now)}`);
    } else if (now < endTime) {
      setTimeRemaining(`Ends in: ${formatTime(endTime - now)}`);
    } else {
      setTimeRemaining("Auction Completed");
    }
  }, [auction]);

  useEffect(() => {
    updateTimeRemaining(); // Initial calculation
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [updateTimeRemaining]);

  // ✅ Correct time formatting
  const formatTime = (ms) => {
    if (ms <= 0) return "0s";

    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    let formattedTime = "";
    if (days > 0) formattedTime += `${days}d `;
    if (hours > 0 || formattedTime) formattedTime += `${hours}h `;
    if (minutes > 0 || formattedTime) formattedTime += `${minutes}m `;
    formattedTime += `${seconds}s`;

    return formattedTime.trim();
  };

  const handleRegister = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found. Please log in.");
      return;
    }
    try {
      await axios.post(`${API_BASE_URL}/api/auctions/${auctionId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsRegistered(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to register.");
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!auction) return <p className="loading">Loading...</p>;

  const now = new Date().getTime();
  const hasStarted = now >= new Date(auction.startDateTime).getTime();
  const hasEnded = now >= new Date(auction.endDateTime).getTime();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  };

  return (
    <div className={`auction-detail-container ${darkMode ? "dark-mode" : ""}`}>
      <button className="back-button" onClick={() => navigate("/mainpage/auctions")}>
        ← Back to Auctions
      </button>

      <h1 className="auction-title">{auction.productName}</h1>
      <p className="auction-description">{auction.description}</p>
      <p className="auction-category"><strong>Category:</strong> {auction.category}</p>
      <p className="auction-price"><strong>Base Price:</strong> ₹{auction.basePrice}</p>
      <p className="auction-seller"><strong>Seller ID:</strong> {auction.sellerId}</p>

      {!hasStarted && (
        <>
          <p className="auction-date"><strong>Start Date:</strong> {new Date(auction.startDateTime).toLocaleString()}</p>
          <p className="auction-date"><strong>End Date:</strong> {new Date(auction.endDateTime).toLocaleString()}</p>
        </>
      )}

      <h3>{hasEnded ? "Auction Completed" : timeRemaining}</h3>

      {/* ✅ React Slick Image Gallery */}
      <div className="auction-gallery">
        <Slider {...sliderSettings}>
          {auction.imageUrls?.map((url, index) => (
            <div key={index} className="image-slide">
              <img src={url} alt={`Auction ${index}`} className="auction-image" />
            </div>
          ))}
        </Slider>
      </div>

      {!hasStarted && !hasEnded && (
        <button onClick={handleRegister} className="register-button" disabled={isRegistered}>
          {isRegistered ? "Registered" : "Register for Auction"}
        </button>
      )}

      {hasStarted && !hasEnded && <p className="info-text">Auction has started. Registration is closed.</p>}
      {hasEnded && <p className="info-text">Auction is completed.</p>}
    </div>
  );
}

export default AuctionDetailParticipant;
