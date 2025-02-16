import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./default_dashboard/Navbar";
import DashboardRoutes from "./default_dashboard/DashboardRoutes"; // Import Dashboard Routes
import "bootstrap/dist/css/bootstrap.min.css";
import "./default_dashboard/global.css";
function App() {
  return (
    <Router>
      <Navbar />
      <DashboardRoutes />
    </Router>
  );
}

export default App;
