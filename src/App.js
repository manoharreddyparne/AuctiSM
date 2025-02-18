import React, { useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./default_dashboard/components/Navbar";
import DashboardRoutes from "./default_dashboard/jsx/DashboardRoutes";
import "bootstrap/dist/css/bootstrap.min.css";
import "./default_dashboard/global.css"; // Global CSS

function App() {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      {/* Global Background applied once */}
      <div className="global-background"></div>

      {/* Router wrapping the Navbar and Routes */}
      <Router>
        <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <DashboardRoutes />
      </Router>
    </>
  );
}

export default App;
