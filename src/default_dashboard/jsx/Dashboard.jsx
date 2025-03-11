// src/seller/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col } from "react-bootstrap";

import AuctionCard from "./AuctionCard";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

const Dashboard = () => {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const authToken = localStorage.getItem("authToken");

  // Fetch all auctions from the backend
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auctions/all`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setAuctions(response.data);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, [authToken]);

  // Helper: Compute status based on start/end times
  const computeStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDateTime);
    const end = new Date(auction.endDateTime);
    if (now < start) return "upcoming";
    if (now >= start && now < end) return "ongoing";
    return "completed";
  };

  // Separate auctions based on computed status
  const ongoingAuctions = auctions.filter((auction) => computeStatus(auction) === "ongoing");
  const upcomingAuctions = auctions.filter((auction) => computeStatus(auction) === "upcoming");
  const completedAuctions = auctions.filter((auction) => computeStatus(auction) === "completed");

  // When an auction card is clicked, navigate to /login
  const handleAuctionClick = () => {
    navigate("/login");
  };

  if (loading) return <p>Loading auctions...</p>;

  return (
    <Container className="dashboard-container">
      <h2 className="dashboard-title">Dashboard</h2>

      <section className="auctions-section">
        <h3>Ongoing Auctions</h3>
        <Row>
          {ongoingAuctions.length > 0 ? (
            ongoingAuctions.map((auction) => (
              <Col key={auction._id} md={3} sm={6} className="mb-4">
                <div onClick={handleAuctionClick} style={{ cursor: "pointer" }}>
                  <AuctionCard auction={auction} />
                </div>
              </Col>
            ))
          ) : (
            <p>No ongoing auctions available.</p>
          )}
        </Row>
      </section>

      <section className="auctions-section">
        <h3>Upcoming Auctions</h3>
        <Row>
          {upcomingAuctions.length > 0 ? (
            upcomingAuctions.map((auction) => (
              <Col key={auction._id} md={3} sm={6} className="mb-4">
                <div onClick={handleAuctionClick} style={{ cursor: "pointer" }}>
                  <AuctionCard auction={auction} />
                </div>
              </Col>
            ))
          ) : (
            <p>No upcoming auctions available.</p>
          )}
        </Row>
      </section>

      <section className="auctions-section">
        <h3>Top Auctions (Completed)</h3>
        <Row>
          {completedAuctions.length > 0 ? (
            completedAuctions.map((auction) => (
              <Col key={auction._id} md={3} sm={6} className="mb-4">
                <div onClick={handleAuctionClick} style={{ cursor: "pointer" }}>
                  <AuctionCard auction={auction} />
                </div>
              </Col>
            ))
          ) : (
            <p>No completed auctions available.</p>
          )}
        </Row>
      </section>
    </Container>
  );
};

export default Dashboard;
