import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaFacebook, FaTwitter, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

const Contact = () => {
  return (
    <footer className="w-100 bg-dark text-white py-5">
      <Container fluid className="px-0">
        <Row className="mx-0">

          <Col md={3} className="mb-4">
            <h4 className="fw-bold">Buyer Section</h4>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white text-decoration-none">Browse Auctions</a></li>
              <li><a href="/" className="text-white text-decoration-none">How to Bid</a></li>
              <li><a href="/" className="text-white text-decoration-none">Buyer FAQs</a></li>
              <li><a href="/" className="text-white text-decoration-none">Secure Payments</a></li>
            </ul>
          </Col>


          <Col md={3} className="mb-4">
            <h4 className="fw-bold">Seller Section</h4>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white text-decoration-none">Create an Auction</a></li>
              <li><a href="/" className="text-white text-decoration-none">Seller Guidelines</a></li>
              <li><a href="/" className="text-white text-decoration-none">Payment & Fees</a></li>
              <li><a href="/" className="text-white text-decoration-none">Seller Support</a></li>
            </ul>
          </Col>


          <Col md={3} className="mb-4">
            <h4 className="fw-bold">Resources</h4>
            <ul className="list-unstyled">
              <li><a href="/" className="text-white text-decoration-none">Auction Tips & Tricks</a></li>
              <li><a href="/" className="text-white text-decoration-none">Bidding Strategies</a></li>
              <li><a href="/" className="text-white text-decoration-none">Community Forum</a></li>
              <li><a href="/" className="text-white text-decoration-none">Help & Support</a></li>
            </ul>
          </Col>


          <Col md={3} className="mb-4">
            <h4 className="fw-bold">Contact Us</h4>
            <p><FaMapMarkerAlt /> 123 Auction Street, Tech City</p>
            <p><FaPhone /> +91 98765 43210</p>
            <p><FaEnvelope /> support@auctism.com</p>
            <div className="d-flex gap-3 fs-4">
              <a href="https://facebook.com" className="text-white" aria-label="Facebook"><FaFacebook /></a>
              <a href="https://twitter.com" className="text-white" aria-label="Twitter"><FaTwitter /></a>
              <a href="https://instagram.com" className="text-white" aria-label="Instagram"><FaInstagram /></a>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Contact;
