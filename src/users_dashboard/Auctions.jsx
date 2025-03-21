import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ParticipateAuctionCard from "../shared_components/ParticipateAuctionCard";
import { AuthContext } from "../utils/AuthContext";

function Auctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("No authentication token found.");
        }
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/all`, config);
        const allAuctions = response.data.filter(
          (auction) => String(auction.sellerId) !== String(user.id)
        );
        setAuctions(allAuctions);
      } catch (error) {
        console.error("Error fetching auctions:", error.response?.data || error.message);
        setError(error.response?.data?.error || "Failed to fetch auctions.");
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [user.id]);

  const now = new Date();
  const ongoingAuctions = auctions.filter(
    (auction) =>
      new Date(auction.startDateTime) <= now && new Date(auction.endDateTime) >= now
  );
  const upcomingAuctions = auctions.filter(
    (auction) => new Date(auction.startDateTime) > now
  );
  const completedAuctions = auctions.filter(
    (auction) => new Date(auction.endDateTime) < now
  );

  const handleAuctionClick = (auctionId) => {
    if (user) navigate(`/auction-detail/${auctionId}`);
  };

  return (
    <div className="container mt-5">
      {loading && <p>Loading auctions...</p>}
      {error && <p className="error-message">⚠️ {error}</p>}
      {!loading && !error && (
        <>
          {ongoingAuctions.length > 0 && (
            <section className="ongoing-auctions">
              <h2>Ongoing Auctions</h2>
              <div className="auction-list">
                {ongoingAuctions.map((auction) => (
                  <ParticipateAuctionCard
                    key={auction._id}
                    auction={auction}
                    onClick={() => handleAuctionClick(auction._id)}
                  />
                ))}
              </div>
            </section>
          )}
          {upcomingAuctions.length > 0 && (
            <section className="upcoming-auctions mt-4">
              <h2>Upcoming Auctions</h2>
              <div className="auction-list">
                {upcomingAuctions.map((auction) => (
                  <ParticipateAuctionCard
                    key={auction._id}
                    auction={auction}
                    onClick={() => handleAuctionClick(auction._id)}
                  />
                ))}
              </div>
            </section>
          )}
          {completedAuctions.length > 0 && (
            <section className="completed-auctions mt-4">
              <h2>Completed Auctions</h2>
              <div className="auction-list">
                {completedAuctions.map((auction) => (
                  <ParticipateAuctionCard
                    key={auction._id}
                    auction={auction}
                    onClick={() => handleAuctionClick(auction._id)}
                  />
                ))}
              </div>
            </section>
          )}
          {ongoingAuctions.length === 0 &&
            upcomingAuctions.length === 0 &&
            completedAuctions.length === 0 && <p>No auctions available.</p>}
        </>
      )}
    </div>
  );
}

export default Auctions;
