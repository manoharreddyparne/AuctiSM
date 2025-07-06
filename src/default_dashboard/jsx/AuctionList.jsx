import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AuctionCard from "./AuctionCard";
import { useNavigate } from "react-router-dom";
import LoginModal from "../../shared_components/LoginModal";

const AuctionList = ({ type, auctions = [], isDarkMode }) => {
  const [visibleAuctions, setVisibleAuctions] = useState(7);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem("darkMode") === "true") {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, []);

  const computeStatus = (auction) => {
    const now = new Date();
    const start = new Date(auction.startDateTime);
    const end = new Date(auction.endDateTime);
    if (now < start) return "upcoming";
    if (now >= start && now < end) return "ongoing";
    return "completed";
  };

  const filteredAuctions = auctions.filter(
    (auction) => computeStatus(auction) === type
  );

  const loadMore = () => {
    setVisibleAuctions((prev) => prev + 7);
  };

  const handleCardClick = (auction) => {
    setShowLoginModal(true);
  };

  const handleModalYes = () => {
    setShowLoginModal(false);
    navigate("/login");
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

      <Row className="gy-4 g-0" style={{ margin: 0 }}>
        {filteredAuctions.length > 0 ? (
          filteredAuctions.slice(0, visibleAuctions).map((auction) => (
            <Col
              key={auction._id}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="mb-2 d-flex justify-content-center"
            >
              <AuctionCard
                auction={auction}
                onCardClick={handleCardClick}
                isDarkMode={isDarkMode}
              />
            </Col>
          ))
        ) : (
          <Col className="text-center">
            <p>No {type} auctions available.</p>
          </Col>
        )}
      </Row>

      {filteredAuctions.length > visibleAuctions && (
        <Row>
          <Col className="text-center">
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

      <LoginModal
        show={showLoginModal}
        onYes={handleModalYes}
        onCancel={() => setShowLoginModal(false)}
      />
    </Container>
  );
};

export default AuctionList;
