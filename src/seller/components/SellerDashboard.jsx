// src/seller/components/SellerDashboard.jsx
import React, { useEffect, useState } from "react";
import CreateAuction from "./CreateAuction";
import AuctionCard from "./AuctionCard";
import { fetchSellerAuctions } from "../services/auctionService";
import { jwtDecode } from "jwt-decode";
// import "./SellerDashboard.css"; // Optional: your dashboard-specific styles

const SellerDashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const authToken = localStorage.getItem("authToken");

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
        // Ensure your backend returns auctions filtered by sellerId.
        setAuctions(data);
      }
      setLoading(false);
    };
    fetchData();
  }, [authToken, userId]);

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
      {/* Create Auction form */}
      <CreateAuction />

      <h2>My Auctions</h2>
      {loading ? (
        <p>Loading auctions...</p>
      ) : (
        <div className="auction-list">
          {auctions.length > 0 ? (
            auctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
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
