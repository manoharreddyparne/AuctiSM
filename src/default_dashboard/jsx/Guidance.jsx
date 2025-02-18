import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import "../css/Guidance.css"; // You can now add Bootstrap classes in the CSS for custom styles

const Guidance = () => {
  return (
    <div className="guidance-page">
      <div className="guidance-background">
        <Container className="text-center text-light py-5">
          <h1 className="display-3 font-weight-bold mb-4">AuctiSM Guidance</h1>
          <p className="lead mb-5">
            Learn how to use the platform effectively, place bids, and get the most out of AuctiSM!
          </p>
          <Button variant="primary" size="lg" href="#how-to-get-started">
            Get Started
          </Button>
        </Container>
      </div>

      <Container className="py-5">
        {/* How to Get Started Section */}
        <Row id="how-to-get-started" className="mb-5">
          <Col>
            <h2 className="guidance-section-title">How to Get Started</h2>
            <ul className="guidance-list">
              <li>Create an account by signing up</li>
              <li>Explore ongoing and upcoming auctions</li>
              <li>Place your bids and monitor auction results</li>
              <li>Be the highest bidder to win the auction</li>
              <li>Complete the transaction via your seller's wallet</li>
            </ul>
          </Col>
        </Row>

        {/* Auction Participation */}
        <Row id="participation" className="mb-5">
          <Col>
            <h2 className="guidance-section-title">How to Participate in an Auction</h2>
            <ul className="guidance-list">
              <li>Select an auction you're interested in</li>
              <li>Set your bidding limit and place your bid</li>
              <li>Stay updated with real-time bidding notifications</li>
              <li>Outbid your competition to win the auction</li>
            </ul>
          </Col>
        </Row>

        {/* Frequently Asked Questions */}
        <Row id="faqs" className="mb-5">
          <Col>
            <h2 className="guidance-section-title">Frequently Asked Questions</h2>
            <ul className="guidance-list">
              <li>How do I place a bid? – Simply select the auction and place your bid in the provided box.</li>
              <li>What happens if I'm outbid? – You'll receive a notification that you've been outbid, and you can place a higher bid.</li>
              <li>How do I check my current bids? – Navigate to your dashboard to see all your active bids.</li>
              <li>How do I complete a transaction after winning? – Payments are made through your wallet system. You'll receive instructions after winning.</li>
              <li>What should I do if I encounter a problem? – Contact support through the Contact page, and we'll assist you.</li>
            </ul>
          </Col>
        </Row>

        {/* Tips & Tricks Section */}
        <Row id="tips" className="mb-5">
          <Col>
            <h2 className="guidance-section-title">Tips and Tricks for Winning Auctions</h2>
            <ul className="guidance-list">
              <li>Bid early to gauge competition, but be mindful of your budget.</li>
              <li>Use the "Max Bid" feature to automate your bid while staying within your limits.</li>
              <li>Set alerts to track auction status and avoid last-minute bidding wars.</li>
              <li>Watch for trends in the bidding activity to make informed decisions.</li>
            </ul>
          </Col>
        </Row>

        {/* Contact and Support */}
        <Row id="support" className="text-center mb-5">
          <Col>
            <h2 className="guidance-section-title">Need Help? Contact Support</h2>
            <p>If you have any issues or need assistance with your auctions, feel free to reach out to us!</p>
            <Button variant="success" href="/contact">
              Contact Us
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Guidance;
