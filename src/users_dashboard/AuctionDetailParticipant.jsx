import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./AuctionDetailParticipant.css";
import BidUpdates from "../seller/components/BidUpdates";
import BidRanking from "./BidRanking"; // Adjust path if needed

function AuctionDetailParticipant() {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [error, setError] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  const darkMode = localStorage.getItem("darkMode") === "enabled";
  const API_BASE_URL = process.env.REACT_APP_API_URL;

  // Helper: Retrieve user ID from localStorage ("userId" or from "user")
  const getLocalUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const userObj = JSON.parse(userData);
          userId = userObj?.id;
        } catch (e) {
          // ignore parse error
        }
      }
    }
    return userId;
  };

  // Fetch auction details and registration status
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
        try {
          const regResponse = await axios.get(`${API_BASE_URL}/api/auctions/${auctionId}/registration-status`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setIsRegistered(regResponse.data.isRegistered);
        } catch (statusError) {
          if (response.data.registeredUsers) {
            const localUserId = getLocalUserId();
            const alreadyRegistered = response.data.registeredUsers.some(
              (user) => user.userId.toString() === localUserId
            );
            setIsRegistered(alreadyRegistered);
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch auction details.");
      }
    };

    fetchAuction();
  }, [auctionId, API_BASE_URL]);

  // Update time remaining
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

  // Helper: Check if the logged-in user's bid is currently top.
  const isUserTop = () => {
    if (!auction || !auction.bids || auction.bids.length === 0) return false;
    const localUserId = getLocalUserId();
    if (!localUserId) return false;
    const userBids = auction.bids.filter(bid => String(bid.bidderId) === String(localUserId));
    if (userBids.length === 0) return false;
    const userHighest = Math.max(...userBids.map(bid => bid.bidAmount));
    const overallHighest = Math.max(...auction.bids.map(bid => bid.bidAmount));
    return userHighest === overallHighest;
  };

  // Compute disabled state for bid controls
  const userIsTopValue = isUserTop();

  // Bid placement handler
  const handlePlaceBid = async () => {
    setBidError(null);
    setBidSuccess(null);
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
      setBidSuccess("Bid placed successfully!");
      setAuction(response.data.auction);
      setBidAmount("");
    } catch (err) {
      setBidError(err.response?.data?.message || "Failed to place bid.");
    }
  };

  // Increment bid input handler
  const handleIncrement = (value) => {
    const current = parseFloat(bidAmount) || 0;
    setBidAmount((current + value).toString());
  };

  // Cancel bid input handler
  const handleCancelBid = () => {
    setBidAmount("");
    setBidError(null);
    setBidSuccess(null);
  };

  // Navigate to registration if not registered
  const handleRegister = () => {
    if (!isRegistered) {
      navigate(`/auction-register/${auctionId}`);
    }
  };

  if (error) return <p className="error">{error}</p>;
  if (!auction) return <p className="loading">Loading...</p>;

  const now = Date.now();
  const hasStarted = now >= new Date(auction.startDateTime).getTime();
  const hasEnded = now >= new Date(auction.endDateTime).getTime();

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
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

      <h3>{timeRemaining}</h3>

      {/* Side-by-side containers for bid history and ranking */}
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
            <BidRanking bids={auction.bids} registrations={auction.registeredUsers} />
          )}
        </div>
      </div>

      <div className="auction-gallery">
        <Slider {...sliderSettings}>
          {auction.imageUrls?.map((url, index) => (
            <div key={index} className="image-slide">
              <img src={url} alt={`Auction ${index}`} className="auction-image" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Registration / Bid Placement */}
      {!hasStarted && !hasEnded && (
        <button className="register-button" onClick={handleRegister} disabled={isRegistered}>
          {isRegistered ? "Already Registered" : "Register for Auction"}
        </button>
      )}

      {hasStarted && !hasEnded && (
        <>
          {isRegistered ? (
            <fieldset disabled={userIsTopValue} style={{ border: "none", padding: 0 }}>
              <div className="bid-section">
                <h4>Place Your Bid</h4>
                <div className="bid-input-container">
                  <input
                    type="number"
                    placeholder="Enter bid amount"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    style={{ width: "150px" }}
                  />
                  <div className="bid-increment-buttons">
                    <button onClick={() => handleIncrement(100)}>+100</button>
                    <button onClick={() => handleIncrement(200)}>+200</button>
                    <button onClick={() => handleIncrement(500)}>+500</button>
                    <button onClick={() => handleIncrement(1000)}>+1000</button>
                  </div>
                </div>
                <div className="bid-action-buttons">
                  <button onClick={handlePlaceBid}>Place Bid</button>
                  <button onClick={handleCancelBid}>Cancel</button>
                </div>
                {userIsTopValue && (
                  <p className="info-text">
                    🚫 Your bid is currently top. Wait for a higher bid.
                  </p>
                )}
                {bidError && <p className="error">{bidError}</p>}
                {bidSuccess && <p className="success">{bidSuccess}</p>}
              </div>
            </fieldset>
          ) : (
            <p className="info-text">Registration is closed. Auction has started.</p>
          )}
        </>
      )}

      {hasEnded && <p className="info-text">Auction is completed.</p>}
      {hasStarted && isRegistered && !hasEnded && (
        <p className="info-text">Auction has begun. Start bidding now!</p>
      )}
    </div>
  );
}

export default AuctionDetailParticipant;
