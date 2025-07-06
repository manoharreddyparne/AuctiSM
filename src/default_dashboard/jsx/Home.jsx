import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Contact from "../../pages/Contact";
import AuctionCard from "./AuctionCard";
import LoginModal from "../../shared_components/LoginModal";
import "../../global.css";
import "../css/Home.css";

const Home = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "enabled");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const updateDarkMode = () => {
    const mode = localStorage.getItem("darkMode") === "enabled";
    setIsDarkMode(mode);
  };

  useEffect(() => {
    window.addEventListener("storage", updateDarkMode);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === "darkMode") updateDarkMode();
    };

    return () => {
      window.removeEventListener("storage", updateDarkMode);
      localStorage.setItem = originalSetItem;
    };
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auctions/public`);
        setAuctions(response.data);
      } catch (error) {
        console.error("Error fetching auctions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const filterByStatus = (status) => {
    const now = new Date();
    return auctions.filter((auction) => {
      const start = new Date(auction.startDateTime);
      const end = new Date(auction.endDateTime);
      if (status === "ongoing") return now >= start && now < end;
      if (status === "upcoming") return now < start;
      if (status === "completed") return now >= end;
      return false;
    });
  };

  const handleCardClick = (auction) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
    } else {
      navigate(`/auction-detail/${auction._id}`);
    }
  };

  const handleModalYes = () => {
    setShowLoginModal(false);
    navigate("/login");
  };

  const handleModalCancel = () => {
    setShowLoginModal(false);
  };

  if (loading) return <p>Loading auctions...</p>;

  return (
    <>
      <div className={`global-background ${isDarkMode ? "dark" : "light"}`}></div>

      {["ongoing", "upcoming", "completed"].map((status) => (
        <section key={status} className="auctions-section">
          <h2 className="text-center mb-4">{status.charAt(0).toUpperCase() + status.slice(1)} Auctions</h2>
          <Row className="px-4">
            {filterByStatus(status).length > 0 ? (
              filterByStatus(status).map((auction) => (
                <Col key={auction._id} md={3} sm={6} className="mb-4">
                  <AuctionCard
                    auction={auction}
                    isDarkMode={isDarkMode}
                    onCardClick={() => handleCardClick(auction)}
                  />
                </Col>
              ))
            ) : (
              <Col>
                <p className="text-center">No {status} auctions available.</p>
              </Col>
            )}
          </Row>
        </section>
      ))}

      <section className="contact-section mt-5 px-3">
        <Contact />
      </section>

      <footer className="text-center py-3" style={{ backgroundColor: "#000", color: "#fff" }}>
        <p className="mb-0">© 2025 AuctiSM. All rights reserved.</p>
      </footer>

      <LoginModal show={showLoginModal} onYes={handleModalYes} onCancel={handleModalCancel} />
    </>
  );
};

export default Home;
