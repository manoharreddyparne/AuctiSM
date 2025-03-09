import React, { useState, useEffect } from "react";
import "../css/dashboard.css"; 
import Navbar from "../../shared_components/Navbar.jsx";
import AuctionCard from "./AuctionCard.jsx";
import auctionData from "./data";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.error("No auth token found, redirecting to login...");
        navigate("/login"); 
        return;
      }

      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        navigate("/login"); 
      }
    };

    fetchUserProfile();
  }, [navigate]);


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
