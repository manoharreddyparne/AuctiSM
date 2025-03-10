import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AuctionCard from "../jsx/AuctionCard";
import auctionData from "../data"; 

const AuctionsList = ({ type }) => {
  const filteredAuctions = auctionData.filter(auction => auction.status === type);
  const [visibleAuctions, setVisibleAuctions] = useState(7); 


  const loadMore = () => {
    setVisibleAuctions(prev => prev + 7); 
  };

  return (
    <section className="auctions-section py-5">
      <Container>
        <h2 className="text-center mb-4">
          {type === "ongoing" ? "Ongoing Auctions" : "Upcoming Auctions"}
        </h2>
        <Row>
          {filteredAuctions.length > 0 ? (
            filteredAuctions.slice(0, visibleAuctions).map((auction) => (
              <Col key={auction.id} md={4} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))
          ) : (
            <Col className="text-center">
              <p>No {type} auctions available.</p>
            </Col>
          )}
        </Row>
        {/* Show "See More..." if there are more auctions to load */}
        {visibleAuctions < filteredAuctions.length && (
          <div className="text-center mt-4">
            <span onClick={loadMore} className="text-primary fw-bold" style={{ cursor: "pointer" }}>
              See More...
            </span>
          </div>
        )}
      </Container>
    </section>
  );
};

export default AuctionsList;
