import React from "react";
import { Container } from "react-bootstrap";
import Contact from "../default_dashboard/Contact";
import AuctionsList from "./AuctionList";

const Home = () => {
  return (
    <div
      className="home-container d-flex flex-column align-items-center justify-content-between text-white text-center w-100 min-vh-100 position-relative"
    >
      {/* Background Overlay */}
      <div className="home-background"></div>

      {/* Ongoing Auctions Section */}
      <Container fluid className="py-5 position-relative">
        <AuctionsList type="ongoing" />
      </Container>

      {/* Upcoming Auctions Section */}
      <Container fluid className="py-5 position-relative">
        <AuctionsList type="upcoming" />
      </Container>

      {/* Contact Section */}
      <Container fluid className="py-5 position-relative">
        <Contact />
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 w-100 text-center position-relative">
        <p className="mb-0">© 2025 AuctiSM. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
