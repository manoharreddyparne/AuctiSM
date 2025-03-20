import React, { useEffect, useState } from "react";
import AuctionCard from "./AuctionCard";
import { fetchSellerAuctions } from "../services/auctionService";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";
import "./SellerDashboard.css";

const SellerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");
  const navigate = useNavigate();
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

  const getAuctionStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDateTime);
    const end = new Date(auction.endDateTime);
    if (now >= end) return "completed";
    if (now >= start) return "ongoing";
    return "upcoming";
  };

  const ongoingAuctions = auctions.filter((a) => getAuctionStatus(a) === "ongoing");
  const upcomingAuctions = auctions.filter((a) => getAuctionStatus(a) === "upcoming");
  const completedAuctions = auctions.filter((a) => getAuctionStatus(a) === "completed");

  const handleCreateAuction = () => {
    navigate("/create-auction");
  };

  return (
    <div className={`seller-dashboard ${darkMode ? "dark" : "light"}`}>
      {loading ? (
        <p>Loading auctions...</p>
      ) : (
        <>
          <section className="auction-section">
            <h2>Ongoing Auctions</h2>
            <div className="auction-list">
              <div className={`create-auction-card ${darkMode ? "dark" : ""}`} onClick={handleCreateAuction}>
                <span className="plus-symbol">+</span>
                <p>Create Auction</p>
              </div>
              {ongoingAuctions.length > 0 ? (
                ongoingAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} darkMode={darkMode} authToken={authToken} />
                ))
              ) : (
                <p className="no-auctions">No ongoing auctions. Create one now!</p>
              )}
            </div>
          </section>

          <section className="auction-section">
            <h2>Upcoming Auctions</h2>
            <div className="auction-list">
              <div className={`create-auction-card ${darkMode ? "dark" : ""}`} onClick={handleCreateAuction}>
                <span className="plus-symbol">+</span>
                <p>Create Auction</p>
              </div>
              {upcomingAuctions.length > 0 ? (
                upcomingAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} darkMode={darkMode} authToken={authToken} />
                ))
              ) : (
                <p className="no-auctions">No upcoming auctions. Create one now!</p>
              )}
            </div>
          </section>

          <section className="auction-section">
            <h2>Completed Auctions</h2>
            <div className="auction-list">
              {completedAuctions.length > 0 ? (
                completedAuctions.map((auction) => (
                  <AuctionCard key={auction._id} auction={auction} darkMode={darkMode} authToken={authToken} />
                ))
              ) : (
                <p className="no-auctions">No completed auctions.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default SellerDashboard;
