import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import io from "socket.io-client";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./AuctionDetailParticipant.css";
import BidUpdates from "../seller/components/BidUpdates";
import BidRanking from "./BidRanking";
import ImageLightbox from "../shared_components/ImageLightbox";

const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000");

function AuctionDetailParticipant() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState("");
  const [bidStatusMsg, setBidStatusMsg] = useState("");
  const darkMode = localStorage.getItem("darkMode") === "enabled";
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  

  const [currentSlide, setCurrentSlide] = useState(0);

  const getLocalUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const userObj = JSON.parse(userData);
          userId = userObj?.id;
        } catch (e) {
          console.log(e);
        }
      }
    }
    return userId;
  };

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


  const fetchAuctionDetails = useCallback(async () => {
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
      try {
        const regResponse = await axios.get(`${API_BASE_URL}/api/auctions/${auctionId}/registration-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsRegistered(regResponse.data.isRegistered);
      } catch (statusError) {
        if (response.data.registeredUsers) {
          const localUserId = getLocalUserId();
          const alreadyRegistered = response.data.registeredUsers.some(
            (user) => String(user.userId) === String(localUserId)
          );
          setIsRegistered(alreadyRegistered);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch auction details.");
    }
  }, [auctionId, API_BASE_URL]);

  useEffect(() => {
    fetchAuctionDetails();
    const pollingInterval = setInterval(fetchAuctionDetails, 3000);
    socket.emit("joinAuction", auctionId);
    return () => clearInterval(pollingInterval);
  }, [fetchAuctionDetails, auctionId]);

  // Listen for auction updates via socket
  useEffect(() => {
    socket.on("auctionUpdated", ({ auction: updatedAuction }) => {
      setAuction(updatedAuction);
    });
    return () => {
      socket.off("auctionUpdated");
    };
  }, []);

  const updateTimeRemaining = useCallback(() => {
    if (!auction) return;
    const now = Date.now();
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
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [updateTimeRemaining]);

  const formatTime = (ms) => {
    if (ms <= 0) return "0s";
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    return `${days ? days + "d " : ""}${hours ? hours + "h " : ""}${minutes ? minutes + "m " : ""}${seconds}s`;
  };

  const isUserTop = useCallback(() => {
    if (!auction || !auction.bids || auction.bids.length === 0) return false;
    const localUserId = getLocalUserId();
    if (!localUserId) return false;
    const userBids = auction.bids.filter(bid => String(bid.bidderId) === String(localUserId));
    if (userBids.length === 0) return false;
    const userHighest = Math.max(...userBids.map(bid => bid.bidAmount));
    const overallHighest = Math.max(...auction.bids.map(bid => bid.bidAmount));
    return userHighest === overallHighest;
  }, [auction]);

  const userIsTopValue = isUserTop();

  const handlePlaceBid = async () => {
    setBidError(null);
    setBidSuccess("");
    setBidStatusMsg("");
    const token = localStorage.getItem("authToken");
    if (!token) {
      setBidError("You must be logged in to place a bid.");
      return;
    }
    if (!bidAmount || isNaN(bidAmount)) {
      setBidError("Please enter a valid bid amount.");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auctions/${auctionId}/bid`,
        { bidAmount: parseFloat(bidAmount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAuction(response.data.auction);
      setBidAmount("");
      setBidSuccess("Bid placed successfully!");

      await sleep(4000);
      if (isUserTop()) {
        setBidStatusMsg("Your bid is currently top. Please wait until others outbid you before placing a new bid.");
      } else {
        setBidStatusMsg("");
      }
      setBidSuccess("");
    } catch (err) {
      setBidError(err.response?.data?.message || "Failed to place bid.");
    }
  };

  const handleIncrement = (value) => {
    const current = parseFloat(bidAmount) || 0;
    setBidAmount((current + value).toString());
  };

  const handleCancelBid = () => {
    setBidAmount("");
    setBidError(null);
    setBidSuccess("");
    setBidStatusMsg("");
  };

  const handleRegister = () => {
    if (!isRegistered) {
      navigate(`/auction-register/${auctionId}`);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  if (error) return <p className="error">{error}</p>;
  if (!auction) return <p className="loading">Loading...</p>;

  const now = Date.now();
  const startTime = new Date(auction.startDateTime).getTime();
  const endTime = new Date(auction.endDateTime).getTime();
  const hasStarted = now >= startTime;
  const hasEnded = now >= endTime;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    afterChange: (index) => setCurrentSlide(index),
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
          <p className="auction-date">
            <strong>Start Date:</strong> {new Date(auction.startDateTime).toLocaleString()}
          </p>
          <p className="auction-date">
            <strong>End Date:</strong> {new Date(auction.endDateTime).toLocaleString()}
          </p>
        </>
      )}
      <h3>{timeRemaining}</h3>

      <div className="bid-info-container">
        <div className="bid-updates-wrapper">
          <BidUpdates 
            auctionId={auctionId} 
            authToken={localStorage.getItem("authToken")} 
            registrations={auction.registeredUsers} 
          />
        </div>
        <div className="bid-ranking-wrapper">
          {auction.bids && auction.bids.length > 0 && (
            <BidRanking 
              bids={auction.bids} 
              registrations={auction.registeredUsers} 
            />
          )}
        </div>
      </div>

      <div className="auction-gallery">
        <Slider {...sliderSettings}>
          {auction.imageUrls?.map((url, index) => (
            <div key={index} className="image-slide" onDoubleClick={() => openLightbox(index)}>
              <img src={url} alt={`Slide ${index + 1}`} className="auction-image" />
            </div>
          ))}
        </Slider>
        {auction.imageUrls && auction.imageUrls.length > 1 && (
          <p className="image-index">
            {currentSlide + 1} / {auction.imageUrls.length}
          </p>
        )}
      </div>

      {!hasStarted && (
        <>
          {isRegistered ? (
            <p className="already-registered">Already Registered</p>
          ) : (
            <button className="register-auction-button" onClick={handleRegister}>
              Register for Auction
            </button>
          )}
        </>
      )}

      {hasStarted && !hasEnded && (
        <>
          {!isRegistered ? (
            <p className="registration-closed">Registrations closed.</p>
          ) : userIsTopValue ? (
            <p className="top-bid-message">
              Your bid is currently top. Please wait until others outbid you before placing a new bid.
            </p>
          ) : (
            <fieldset style={{ border: "none", padding: 0 }}>
              <div className="bid-section">
                <h4>Place Your Bid</h4>
                <div className="bid-input-container">
                  <input
                    type="number"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                  />
                  <div className="bid-increment-buttons">
                    <button type="button" onClick={() => handleIncrement(100)}>
                      + ₹100
                    </button>
                    <button type="button" onClick={() => handleIncrement(500)}>
                      + ₹500
                    </button>
                    <button type="button" onClick={handleCancelBid}>
                      Cancel
                    </button>
                  </div>
                  {bidError && <p className="error">{bidError}</p>}
                  {bidSuccess && <p className="success">{bidSuccess}</p>}
                  {bidStatusMsg && <p className="info-text">{bidStatusMsg}</p>}
                  <div className="bid-action-buttons">
                    <button
                      type="button"
                      className="place-bid-button"
                      onClick={handlePlaceBid}
                      disabled={!bidAmount || isNaN(bidAmount)}
                    >
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            </fieldset>
          )}
        </>
      )}

      {hasEnded && <p className="auction-ended">Auction has ended.</p>}

      {lightboxOpen && (
        <ImageLightbox
          images={auction.imageUrls}
          initialIndex={lightboxIndex}
          onClose={closeLightbox}
          darkMode={darkMode}
          productTitle={auction.productName}
        />
      )}
    </div>
  );
}

export default AuctionDetailParticipant;
