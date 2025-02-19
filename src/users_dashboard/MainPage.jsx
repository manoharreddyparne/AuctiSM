// users_dashboard/MainPage.jsx
import React, { useState, useEffect } from "react";
import "../shared_components/Navbar.css";
import UserNavbar from "./UserNavbar.jsx";
import AuctionCard from "../default_dashboard/jsx/AuctionCard.jsx"; // Reusing component
import auctionData from "../default_dashboard/data.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get("http://localhost:5000/profile", {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUser(response.data);
      } catch (error) {
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (auctionData.length > 0) {
      setData(auctionData);
    }
  }, []);

  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="dashboard-container">
      <UserNavbar />
      <h2 className="dashboard-title">Welcome, {user.message}!</h2>
      <h3 className="dashboard-subtitle">Your Auctions</h3>
      <div className="auction-list">
        {data.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}

export default MainPage;
