import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "./default_dashboard/Navbar";
import DashboardRoutes from "./default_dashboard/DashboardRoutes"; // Import Dashboard Routes

function App() {
  return (
    <Router>
      <Navbar />
      <DashboardRoutes />
    </Router>
  );
}

export default App;
