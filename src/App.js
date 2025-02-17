import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./default_dashboard/Navbar.jsx";
import DashboardRoutes from "./default_dashboard/DashboardRoutes.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import "./default_dashboard/global.css";  // Global CSS

function App() {
  return (
    <>
      {/* Global Background applied once */}
      <div className="global-background"></div>

      {/* Router wrapping the Navbar and Routes */}
      <Router>
        <Navbar />
        <DashboardRoutes />
      </Router>
    </>
  );
}

export default App;
