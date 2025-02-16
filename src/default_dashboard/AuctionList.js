import React, { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import AuctionCard from "../default_dashboard/AuctionCard";
import auctionData from "../default_dashboard/data";

const AuctionsList = ({ type }) => {
  // Filter auctions based on the provided type (ongoing or upcoming)
  const filteredAuctions = auctionData.filter(auction => auction.status === type);

  // Pagination state
  const [visibleAuctions, setVisibleAuctions] = useState(9);

  // Load more auctions
  const loadMoreAuctions = () => {
    setVisibleAuctions(prev => prev + 5);
  };

  return (
    <section className="auctions-section py-5">
      <Container>
        <h2 className="text-center mb-4">
          {type === "ongoing" ? "Ongoing Auctions" : "Upcoming Auctions"}
        </h2>
        <Row>
          {filteredAuctions.length > 0 ? (
            filteredAuctions.slice(0, visibleAuctions).map(auction => (
              <Col key={auction.id} md={4} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))
          ) : (
            <p className="text-center">No {type} auctions available.</p>
          )}
        </Row>
        {visibleAuctions < filteredAuctions.length && (
          <div className="text-center mt-4">
            <span  onClick={loadMoreAuctions} className="text-primary fw-bold" style={{ cursor: "pointer" }}>
              See More...
            </span>
          </div>
        )}
      </Container>
    </section>
  );
};

export default AuctionsList;
