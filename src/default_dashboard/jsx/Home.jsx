import React, { useState, useEffect } from "react";
import axios from "axios";
import Contact from "../../pages/Contact";
import AuctionList from "./AuctionList"; 


const Home = () => {

  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("darkMode") === "enabled");
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);


  const updateDarkMode = () => {
    const mode = localStorage.getItem("darkMode") === "enabled";
    setIsDarkMode(mode);
  };

  useEffect(() => {
    window.addEventListener("storage", updateDarkMode);

    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function (key, value) {
      originalSetItem.apply(this, arguments);
      if (key === "darkMode") {
        updateDarkMode(); 
      }
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

  if (loading) return <p>Loading auctions...</p>;

  return (
    <div className={`home-container ${isDarkMode ? "dark-mode" : ""}`} style={{ margin: 0, padding: 0 }}>
      <div className="auction-section">
        <AuctionList
          type="ongoing"
          auctions={auctions}
          isDarkMode={isDarkMode}
        />
      </div>
      <div className="auction-section">
        <AuctionList
          type="upcoming"
          auctions={auctions}
          isDarkMode={isDarkMode}
        />
      </div>
      <div className="auction-section">
        <AuctionList
          type="completed"
          auctions={auctions}
          isDarkMode={isDarkMode}
        />
      </div>
      <div className="contact-section">
        <Contact />
      </div>

      <footer style={{ backgroundColor: "#000", color: "#fff", padding: "10px 0", textAlign: "center", width: "100%", margin: 0 }}>
        <p className="mb-0">© 2025 AuctiSM. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
