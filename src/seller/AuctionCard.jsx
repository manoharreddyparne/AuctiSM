import React from "react";
import axios from "axios";

const AuctionCard = ({ auction }) => {
  const token = localStorage.getItem("authToken");

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/auctions/${auction._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Auction deleted");
    } catch (error) {
      console.error("Error deleting auction:", error);
    }
  };

  return (
    <div>
      <h3>{auction.title}</h3>
      <p>{auction.description}</p>
      <p>Starting Bid: ${auction.startingBid}</p>
      <p>Ends At: {new Date(auction.endTime).toLocaleString()}</p>
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
};

export default AuctionCard;
