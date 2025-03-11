import React, { useState, useEffect } from "react";

// Helper to truncate a name (e.g., first 3 and last 3 characters)
const truncateName = (name) => {
  if (!name) return "Anonymous";
  if (name.length <= 6) return name;
  return `${name.slice(0, 3)}...${name.slice(-3)}`;
};

const BidUpdates = ({ auctionId, authToken, registrations = [] }) => {
  const [currentBid, setCurrentBid] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/bids`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`Error fetching bids: ${response.status}`);
        }
        const data = await response.json();
        setCurrentBid(data.currentBid);
        setBidHistory(data.bids);
        setError(null);
      } catch (err) {
        console.error("Error fetching bids:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch and then poll every 2 seconds
    fetchBids();
    const interval = setInterval(fetchBids, 2000);
    return () => clearInterval(interval);
  }, [auctionId, authToken]);

  if (loading) {
    return <div className="bid-updates">Loading bid updates...</div>;
  }

  if (error) {
    return <div className="bid-updates">Error: {error}</div>;
  }

  return (
    <div
      className="bid-updates"
      style={{
        maxHeight: "200px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px",
      }}
    >
      <h3>Current Bid: ₹{currentBid || "N/A"}</h3>
      <h4>Bid History:</h4>
      <ul>
        {bidHistory.length > 0 ? (
          bidHistory.map((bid, idx) => {
            const reg = registrations.find(
              (r) => String(r.userId) === String(bid.bidderId)
            );
            const displayName =
              reg && reg.fullName ? truncateName(reg.fullName) : "Anonymous";
            return (
              <li key={idx}>
                {displayName} bid ₹{bid.bidAmount} at{" "}
                {new Date(bid.bidTime).toLocaleTimeString()}
              </li>
            );
          })
        ) : (
          <li>No bids yet.</li>
        )}
      </ul>
    </div>
  );
};

export default BidUpdates;
