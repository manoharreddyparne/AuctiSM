// src/seller/components/BidUpdates.jsx
import React, { useState, useEffect } from "react";

const BidUpdates = ({ auctionId, authToken }) => {
  const [currentBid, setCurrentBid] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/bids`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCurrentBid(data.currentBid);
          setBidHistory(data.bids);
        } else {
          console.error("Error fetching bids", response.status);
        }
      } catch (error) {
        console.error("Error fetching bids", error);
      }
    };

    // Fetch bids immediately and then poll every 2 seconds
    fetchBids();
    const interval = setInterval(fetchBids, 2000);
    return () => clearInterval(interval);
  }, [auctionId, authToken]);

  return (
    <div className="bid-updates">
      <h3>Current Bid: ₹{currentBid || "N/A"}</h3>
      <h4>Bid History:</h4>
      <ul>
        {bidHistory.length > 0 ? (
          bidHistory.map((bid, idx) => (
            <li key={idx}>
              {bid.bidder} bid ₹{bid.amount} at{" "}
              {new Date(bid.time).toLocaleTimeString()}
            </li>
          ))
        ) : (
          <li>No bids yet.</li>
        )}
      </ul>
    </div>
  );
};

export default BidUpdates;
