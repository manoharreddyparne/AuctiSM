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


  useEffect(() => {
    console.log(`AuctionList (${type}): Found ${filteredAuctions.length} auctions`);
  }, [filteredAuctions, type]);


  const handleCardClick = () => {
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
      

      <LoginModal
        show={showLoginModal}
        onYes={handleModalYes}  
        onCancel={() => setShowLoginModal(false)} 
      />
    </Container>
  );
};

export default AuctionList;
