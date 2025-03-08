// src/users_dashboard/Auctions.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ParticipateAuctionCard from "../shared_components/ParticipateAuctionCard";
import { AuthContext } from "../utils/AuthContext";

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }
        console.log("🟢 Using token:", token);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get("http://localhost:5000/api/auctions/all", config);
        console.log("✅ Auctions fetched:", response.data);
        setAuctions(response.data);
      } catch (error) {
        console.error("❌ Error fetching auctions:", error.response?.data || error.message);
        setError(error.response?.data?.error || "Failed to fetch auctions.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const handleAuctionClick = (auctionId) => {
    if (user) navigate(`/auction-detail/${auctionId}`);
  };

  return (
    <div className="container mt-5">
      <h1>Available Auctions</h1>
      {loading && <p>Loading auctions...</p>}
      {error && <p className="error-message">⚠️ {error}</p>}
      {!loading && !error && (
        <>
          {auctions.length > 0 ? (
            <div className="auction-list">
              {auctions.map((auction) => (
                <ParticipateAuctionCard
                  key={auction._id}
                  auction={auction}
                  onClick={() => handleAuctionClick(auction._id)}
                />
              ))}
            </div>
          ) : (
            <p>No auctions available.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Auctions;
