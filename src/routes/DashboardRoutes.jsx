// src/routes/DashboardRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../default_dashboard/jsx/Home"; // Home page for non-logged-in users
import Contact from "../pages/Contact"; // Contact page
import GetStarted from "../pages/GetStarted"; // Get Started page
import Help from "../pages/Help"; // Help page
import Login from "../pages/Login"; // Login page
import Signup from "../pages/Signup"; // Signup page
import Error404Page from "../pages/404ErrorPage"; // Error page for unmatched routes
import Auctions from "../default_dashboard/jsx/Auctions"; // Auctions page
import Guidance from "../default_dashboard/jsx/Guidance"; // Guidance page

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} /> {/* Home page for non-logged-in users */}
      <Route path="/home" element={<Home />} /> {/* Add the /home route */}
      <Route path="/auctions" element={<Auctions />} />
      <Route path="/guidance" element={<Guidance />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Error404Page />} /> {/* Catch-all route */}
    </Routes>
  );
}

export default DashboardRoutes;
