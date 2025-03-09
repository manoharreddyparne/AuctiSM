import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Navbar from "../components/Navbar";
import DashboardRoutes from "./DashboardRoutes";
import "bootstrap/dist/css/bootstrap.min.css";
import "../global.css";  

function App() {
  return (
    <>

      <div className="global-background"></div>


      <Router>
        <Navbar />
        <DashboardRoutes />
      </Router>
    </>
  );
}

export default App;
