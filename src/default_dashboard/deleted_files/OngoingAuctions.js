import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import AuctionCard from "../AuctionCard"; // Assuming it's inside default_dashboard
import auctionData from "../data"; // Static auction data for now

const OngoingAuctions = () => {
  const today = new Date();

  // Filter auctions where endDate is still in the future (ongoing)
  const ongoingAuctions = auctionData.filter(auction => new Date(auction.endDate) > today);

  return (
    <section className="ongoing-auctions py-5">
      <Container>
        <h2 className="text-center mb-4">Ongoing Auctions</h2>
        <Row>
          {ongoingAuctions.length > 0 ? (
            ongoingAuctions.map(auction => (
              <Col key={auction.id} md={4} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">No ongoing auctions available.</p>
            </Col>
          )}
        </Row>
      </Container>
    </section>
  );
};

export default OngoingAuctions;
