import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";
import AuctionCard from "./AuctionCard";
import { useNavigate } from "react-router-dom";
import LoginModal from "../../shared_components/LoginModal";
import "./dashboard.css";

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);  // Track login status
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

  const navigate = useNavigate();

  // Fetch auctions on mount
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/public`);
        setAuctions(response.data);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken"); // Get auth token from localStorage
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  // Listen for storage events to update dark mode in real time
  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem("darkMode") === "enabled");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Update document body class based on dark mode
  useEffect(() => {
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  // Compute auction status
  const computeStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDateTime);
    const end = new Date(auction.endDateTime);
    if (now < start) return "upcoming";
    if (now >= start && now < end) return "ongoing";
    return "completed";
  };

  const categorizedAuctions = { ongoing: [], upcoming: [], completed: [] };
  auctions.forEach((auction) => {
    const status = computeStatus(auction);
    categorizedAuctions[status].push(auction);
  });

  // Handle auction click (show login modal if not logged in)
  const handleAuctionClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      // If user is not logged in, show the login modal
      setShowLoginModal(true);
    } else {
      // If logged in, handle auction click (navigate to auction detail)
      navigate(`/auction-detail/${e.target.closest('.auction-item').id}`);
    }
  };

  const handleModalYes = () => {
    setShowLoginModal(false);
    navigate("/login"); // Navigate to login page after user confirms
  };

  if (loading) return <p>Loading auctions...</p>;

  return (
    <div className={`dashboard-container ${isDarkMode ? "dark-mode" : ""}`}>
      <div className="global-background"></div>
      <h2 className="dashboard-title">Dashboard</h2>
      {["ongoing", "upcoming", "completed"].map((status) => (
        <section key={status} className="auctions-section">
          <h3>
            {status.charAt(0).toUpperCase() + status.slice(1)} Auctions (
            {categorizedAuctions[status].length})
          </h3>
          <div className="auction-list">
            {categorizedAuctions[status].length > 0 ? (
              categorizedAuctions[status].map((auction) => (
                <div id={auction._id} key={auction._id} className="auction-item">
                  <Button
                    variant="link"
                    type="button"
                    onClick={handleAuctionClick}
                    style={{ padding: 0, textDecoration: "none" }}
                  >
                    <AuctionCard auction={auction} isDarkMode={isDarkMode} />
                  </Button>
                </div>
              ))
            ) : (
              <p>No {status} auctions available.</p>
            )}
          </div>
        </section>
      ))}
      <LoginModal
        show={showLoginModal}
        onYes={handleModalYes}
        onCancel={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default Dashboard;
