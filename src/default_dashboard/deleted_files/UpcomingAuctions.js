import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import AuctionCard from "../AuctionCard"; // Assuming it's inside default_dashboard
import auctionData from "../data"; // Static auction data for now

const UpcomingAuctions = () => {
  // Filter upcoming auctions from data
  const upcomingAuctions = auctionData.filter(auction => auction.status === "upcoming");

  return (
    <section className="upcoming-auctions py-5">
      <Container>
        <h2 className="text-center mb-4">Upcoming Auctions</h2>
        <Row>
          {upcomingAuctions.length > 0 ? (
            upcomingAuctions.map(auction => (
              <Col key={auction.id} md={4} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))
          ) : (
            <p className="text-center">No upcoming auctions available.</p>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default UpcomingAuctions;
