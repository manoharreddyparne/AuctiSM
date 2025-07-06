import "../../global.css";
import React, { useState } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import AuctionCard from "./AuctionCard";
import auctionData from "../data";
import Pagination from "./Pagination";
import LoginModal from "../../shared_components/LoginModal";

const Auctions = () => {
  const [visibleTop, setVisibleTop] = useState(7);
  const [visibleRecent, setVisibleRecent] = useState(7);
  const [visibleTopBid, setVisibleTopBid] = useState(7);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCardClick = () => {
    setShowLoginModal(true);
  };

  const handleModalYes = () => {
    window.location.href = "/login";
  };

  const handleModalCancel = () => {
    setShowLoginModal(false);
  };

  const lastMonthWinners = auctionData.filter(
    (auction) => auction.status === "winner-last-month"
  );
  const ongoingAuctions = auctionData.filter(
    (auction) => auction.status === "ongoing"
  );
  const recentAuctions = auctionData.filter(
    (auction) => auction.status === "recent"
  );
  const topBidAuctions = auctionData.filter(
    (auction) => auction.status === "top-bid-this-month"
  );

  return (
    <>
      <div className="global-background"></div>

      <section className="auctions-section py-5">
        <Container>
          {/* Ongoing Auctions */}
          <h2 className="text-center mb-4">Top Auctions</h2>
          <Row>
            {ongoingAuctions.slice(0, visibleTop).map((auction) => (
              <Col key={auction.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <AuctionCard
                  auction={auction}
                  onCardClick={handleCardClick}
                  isDarkMode={false}
                />
              </Col>
            ))}
          </Row>
          <Pagination
            visibleItems={visibleTop}
            totalItems={ongoingAuctions.length}
            onLoadMore={setVisibleTop}
          />

          {/* Recent Auctions */}
          <h2 className="text-center mb-4">Recent Auctions</h2>
          <Row>
            {recentAuctions.slice(0, visibleRecent).map((auction) => (
              <Col key={auction.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <AuctionCard
                  auction={auction}
                  onCardClick={handleCardClick}
                  isDarkMode={false}
                />
              </Col>
            ))}
          </Row>
          <Pagination
            visibleItems={visibleRecent}
            totalItems={recentAuctions.length}
            onLoadMore={setVisibleRecent}
          />

          {/* Top Bids */}
          <h2 className="text-center mb-4">Top Bid This Month</h2>
          <Row>
            {topBidAuctions.slice(0, visibleTopBid).map((auction) => (
              <Col key={auction.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <AuctionCard
                  auction={auction}
                  onCardClick={handleCardClick}
                  isDarkMode={false}
                />
              </Col>
            ))}
          </Row>
          <Pagination
            visibleItems={visibleTopBid}
            totalItems={topBidAuctions.length}
            onLoadMore={setVisibleTopBid}
          />

          {/* Winners Table */}
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
                    <td>{winner.productName}</td>
                    <td>₹{winner.bid}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No winners available.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Container>
      </section>

      <LoginModal
        show={showLoginModal}
        onYes={handleModalYes}
        onCancel={handleModalCancel}
      />
    </>
  );
};

export default Auctions;
