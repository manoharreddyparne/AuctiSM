
import React, { useState, useEffect } from "react";
import "../users_dashboard/UserNavbar.css";
import UserNavbar from "./UserNavbar.jsx";
import AuctionCard from "../default_dashboard/jsx/AuctionCard.jsx";
import auctionData from "../default_dashboard/data.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Home from "./Home.jsx";

function MainPage() {
  const [data, setData] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );
        setUser(response.data.user);
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

  if (!user) return <div>{<Home />}</div>;

  const ongoingAuctions = data.filter(
    (auction) => auction.status === "ongoing"
  );
  const upcomingAuctions = data.filter(
    (auction) => auction.status === "upcoming"
  );

  return (
    <div className="dashboard-container">
      <UserNavbar />
      <h2 className="dashboard-title">Welcome, {user.name}!</h2>
      <h3 className="dashboard-subtitle">Your Registered Auctions</h3>

 
      <section>
        <h4>Ongoing Auctions</h4>
        <div className="auction-list">
          {ongoingAuctions.length > 0 ? (
            ongoingAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))
          ) : (
            <p>No ongoing auctions found.</p>
          )}
        </div>
      </section>

      <section>
        <h4>Upcoming Auctions</h4>
        <div className="auction-list">
          {upcomingAuctions.length > 0 ? (
            upcomingAuctions.map((auction) => (
              <AuctionCard key={auction.id} auction={auction} />
            ))
          ) : (
            <p>No upcoming auctions found.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default MainPage;
