import React from 'react';


const truncateName = (name) => {
  if (!name) return "Anonymous";
  if (name.length <= 6) return name;
  return `${name.slice(0, 3)}...${name.slice(-3)}`;
};

const BidRanking = ({ bids, registrations }) => {

  const uniqueBidsMap = new Map();
  bids.forEach(bid => {
    const key = bid.bidderId.toString();
    if (uniqueBidsMap.has(key)) {
      const existing = uniqueBidsMap.get(key);

      if (bid.bidAmount > existing.bidAmount) {
        uniqueBidsMap.set(key, bid);
      }
    } else {
      uniqueBidsMap.set(key, bid);
    }
  });
  const uniqueBids = Array.from(uniqueBidsMap.values());

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
