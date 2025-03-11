import React from 'react';

// Helper to truncate a name (e.g. first 3 and last 3 characters)
const truncateName = (name) => {
  if (!name) return "Anonymous";
  if (name.length <= 6) return name;
  return `${name.slice(0, 3)}...${name.slice(-3)}`;
};

const BidRanking = ({ bids, registrations }) => {
  // Group bids by bidder so that each user appears only once
  const uniqueBidsMap = new Map();
  bids.forEach(bid => {
    const key = bid.bidderId.toString();
    if (uniqueBidsMap.has(key)) {
      const existing = uniqueBidsMap.get(key);
      // Keep the higher bid for that user
      if (bid.bidAmount > existing.bidAmount) {
        uniqueBidsMap.set(key, bid);
      }
    } else {
      uniqueBidsMap.set(key, bid);
    }
  });
  const uniqueBids = Array.from(uniqueBidsMap.values());

  // Sort the unique bids in descending order by bidAmount
  const sortedBids = uniqueBids.sort((a, b) => b.bidAmount - a.bidAmount);

  return (
    <div
      className="bid-ranking"
      style={{
        maxHeight: "200px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px",
        marginTop: "10px"
      }}
    >
      <h4>Bid Rankings</h4>
      {sortedBids.length > 0 ? (
        <ol>
          {sortedBids.map((bid) => {
            // Find registration info by matching bidderId with registeredUsers' userId
            const reg = registrations.find(
              (reg) => reg.userId.toString() === bid.bidderId.toString()
            );
            const displayName = reg && reg.fullName ? truncateName(reg.fullName) : "Anonymous";
            return (
              <li key={bid.bidderId}>
                {displayName}: ₹{bid.bidAmount}
              </li>
            );
          })}
        </ol>
      ) : (
        <p>No bids yet.</p>
      )}
    </div>
  );
};

export default BidRanking;
