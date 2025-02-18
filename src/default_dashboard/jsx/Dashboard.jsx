import React, { useState, useEffect } from "react";
import "../css/dashboard.css"; // Import the CSS file
import Navbar from "../../shared_components/Navbar.jsx";
import AuctionCard from "./AuctionCard.jsx";
import auctionData from "./data";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch user data (authentication)
  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.error("No auth token found, redirecting to login...");
        navigate("/login"); // Redirect if not logged in
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/login"); // Redirect if token is invalid
      }
    };

    fetchUserProfile();
  }, [navigate]);

  // Fetch auction data
  useEffect(() => {
    if (auctionData && auctionData.length > 0) {
      setData(auctionData);
    }
  }, []);

  if (!user) {
    return <div>Loading user data...</div>; // Show loading while fetching user
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="dashboard-title">Welcome, {user.message}!</h2>
      <h3 className="dashboard-subtitle">Ongoing Auctions</h3>
      <div className="auction-list">
        {data.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
