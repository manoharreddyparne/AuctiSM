import React from "react";
import "./Dashboard.css"; // Import the CSS file
import Navbar from "./Navbar";
import AuctionCard from "./AuctionCard";
import auctionData from "./data";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <Navbar />
      <h2 className="dashboard-title">Ongoing Auctions</h2>
      <div className="auction-list">
        {auctionData.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
