// src/seller/components/SellerDashboard.jsx
import React, { useEffect, useState } from "react";
import AuctionCard from "./AuctionCard";
import { fetchSellerAuctions } from "../services/auctionService";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Poll dark mode from localStorage instantly (0ms interval)
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDark = localStorage.getItem("darkMode") === "enabled";
      setDarkMode(currentDark);
    }, 0);
    return () => clearInterval(interval);
  }, []);

  let userId;
  try {
    const decodedToken = jwtDecode(authToken);
    userId = decodedToken.userId;
  } catch (error) {
    console.error("Error decoding token:", error);
  }

  useEffect(() => {
    const fetchData = async () => {
      if (authToken && userId) {
        const data = await fetchSellerAuctions(authToken);
        setAuctions(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [authToken, userId]);

  const handleCreateAuction = () => {
    navigate("/create-auction");
  };

  return (
    <div className="seller-dashboard">
      <h1>My Auctions</h1>
      {loading ? (
        <p>Loading auctions...</p>
      ) : (
        <div className="auction-list">
          {/* Plus card to navigate to CreateAuction page */}
          <div
            className={`create-auction-card ${darkMode ? "dark" : ""}`}
            onClick={handleCreateAuction}
          >
            <span className="plus-symbol">+</span>
            <p>Create Auction</p>
          </div>
          {auctions.length > 0 ? (
            auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} darkMode={darkMode} />
            ))
          ) : (
            <p>No auctions found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
