import React, { useState, useEffect } from "react";
import "./Dashboard.css"; // Import the CSS file
import Navbar from "./Navbar.jsx";
import AuctionCard from "./AuctionCard.jsx";
import auctionData from "./data.jsx";

function Dashboard() {
  const [data, setData] = useState([]);

  // Fetch data only if needed (or use static data)
  useEffect(() => {
    if (auctionData && auctionData.length > 0) {
      setData(auctionData);
    }
  }, []); // Empty dependency array to fetch data only once

  // If no data is available, show loading state
  if (data.length === 0) {
    return <div>Loading...</div>; // Show loading while data is being fetched
  }

  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="dashboard-title">Ongoing Auctions</h2>
      <div className="auction-list">
        {data?.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
