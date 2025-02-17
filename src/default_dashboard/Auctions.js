import React from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import AuctionCard from "../default_dashboard/AuctionCard";
import auctionData from "../default_dashboard/data";
import "./global.css"; // Applying global background

const Auctions = () => {
  // Fetching winners from last month
  const lastMonthWinners = auctionData.filter(auction => auction.status === "winner-last-month");

  return (
    <section className="auctions-section py-5">
      <Container>
        <h2 className="text-center mb-4">Top Auctions</h2>
        <Row>
          {auctionData
            .filter(auction => auction.status === "ongoing")
            .map((auction) => (
              <Col key={auction.id} md={3} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))}
        </Row>

        <h2 className="text-center mb-4">Recent Auctions</h2>
        <Row>
          {auctionData
            .filter(auction => auction.status === "recent")
            .map((auction) => (
              <Col key={auction.id} md={3} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))}
        </Row>

        <h2 className="text-center mb-4">Top Bid This Month</h2>
        <Row>
          {auctionData
            .filter(auction => auction.status === "top-bid-this-month")
            .map((auction) => (
              <Col key={auction.id} md={3} sm={6} className="mb-4">
                <AuctionCard auction={auction} />
              </Col>
            ))}
        </Row>

        <h2 className="text-center mb-4">Winner's List Last Month</h2>
        <Table striped bordered hover className="text-white">
          <thead>
            <tr>
              <th>Winner Name</th>
              <th>Product</th>
              <th>Winning Bid</th>
            </tr>
          </thead>
          <tbody>
            {lastMonthWinners.length > 0 ? (
              lastMonthWinners.map((winner, index) => (
                <tr key={index}>
                  <td>{winner.winner}</td>
                  <td>{winner.title}</td>
                  <td>${winner.highestBid}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">No winners available.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </section>
  );
};

export default Auctions;
