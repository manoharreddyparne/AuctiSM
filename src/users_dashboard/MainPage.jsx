import React, { useState, useEffect } from "react";
import "../users_dashboard/UserNavbar.css";
import UserNavbar from "./UserNavbar.jsx";
import AuctionCard from "../default_dashboard/jsx/AuctionCard.jsx";
import auctionData from "../default_dashboard/data.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          console.error("No auth token found. Redirecting to login...");
          navigate("/login");
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/profile`, {  // ✅ Ensure correct endpoint
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        setUser(response.data.user); // ✅ Access 'user' field in response
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        navigate("/login");
      }
    };

    fetchUserProfile();
  }, [navigate]);

  useEffect(() => {
    if (auctionData && auctionData.length > 0) {
      setData(auctionData);
    } else {
      console.warn("No auction data available.");
    }
  }, []);

  if (!user) return <div>Loading user data...</div>;

  return (
    <div className="dashboard-container">
      <UserNavbar />
      <h2 className="dashboard-title">Welcome, {user.name}!</h2>
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
