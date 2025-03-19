import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AuctionCard from "./AuctionCard";
import { useNavigate } from "react-router-dom";
import LoginModal from "../../shared_components/LoginModal"; // Import the LoginModal

const AuctionList = ({ type, auctions = [], isDarkMode }) => {
  const [visibleAuctions, setVisibleAuctions] = useState(7);
  const [showLoginModal, setShowLoginModal] = useState(false); // State to control the modal visibility
  const navigate = useNavigate();

  // Debug: log the dark mode prop when AuctionList mounts
  useEffect(() => {
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, []);

  const computeStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDateTime);
    const end = new Date(auction.endDateTime);
    if (now < start) return "upcoming";
    else if (now >= start && now < end) return "ongoing";
    else return "completed";
  };

  const filteredAuctions = auctions.filter(
    (auction) => computeStatus(auction) === type
  );

  const loadMore = () => {
    setVisibleAuctions((prev) => prev + 7);
  };

  // Debug: log filtered auctions count
  useEffect(() => {
    console.log(`AuctionList (${type}): Found ${filteredAuctions.length} auctions`);
  }, [filteredAuctions, type]);

  // Callback for AuctionCard click – show login modal instead of navigating directly
  const handleCardClick = () => {
    setShowLoginModal(true); // Show the login modal
  };

  // Function to handle the modal confirmation (proceed to login page)
  const handleModalYes = () => {
    setShowLoginModal(false);
    navigate("/login"); // Navigate to login page
  };

  return (
    <Container fluid style={{ padding: 0, margin: 0 }}>
      <h2 className="text-center" style={{ marginBottom: "10px" }}>
        {type === "ongoing"
          ? "Ongoing Auctions"
          : type === "upcoming"
          ? "Upcoming Auctions"
          : "Completed Auctions"}
      </h2>
      <Row className="gy-4 g-0" style={{ margin: 0, padding: 0 }}>
        {filteredAuctions.length > 0 ? (
          filteredAuctions.slice(0, visibleAuctions).map((auction) => (
            <Col key={auction._id} md={3} sm={6} className="mb-2" style={{ padding: "0 2px" }}>
              <AuctionCard auction={auction} onCardClick={handleCardClick} isDarkMode={isDarkMode} />
            </Col>
          ))
        ) : (
          <Col className="text-center" style={{ padding: 0 }}>
            <p>No {type} auctions available.</p>
          </Col>
        )}
      </Row>
      {filteredAuctions.length > visibleAuctions && (
        <Row style={{ margin: 0, padding: 0 }}>
          <Col className="text-center" style={{ padding: 0 }}>
            <span
              onClick={loadMore}
              className="text-primary fw-bold"
              style={{ cursor: "pointer", marginTop: "5px" }}
            >
              See More...
            </span>
          </Col>
        </Row>
      )}
      
      {/* Add Login Modal */}
      <LoginModal
        show={showLoginModal}
        onYes={handleModalYes}  // If user confirms, proceed to login page
        onCancel={() => setShowLoginModal(false)}  // Close the modal without navigating
      />
    </Container>
  );
};

export default AuctionList;
