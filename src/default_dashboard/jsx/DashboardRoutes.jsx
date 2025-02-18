import React from "react";
import { Routes, Route } from "react-router-dom";

// Import pages
import Home from "./Home";
import Auctions from "./Auctions";
import Guidance from "./Guidance";

// External Pages
import Contact from "../../pages/Contact";
import GetStarted from "../../pages/GetStarted";
import Help from "../../pages/Help";
import Login from "../../pages/Login";
import Signup from "../../pages/Signup";

// Error page
import Error404Page from "../../pages/404ErrorPage"; // Ensure the path is correct

function DashboardRoutes() {
  return (
    <Routes>
      {/* Dashboard Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/auctions" element={<Auctions />} />
      <Route path="/guidance" element={<Guidance />} />

      {/* External Pages */}
      <Route path="/contact" element={<Contact />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* 404 Error Page for Invalid Routes */}
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}

export default DashboardRoutes;
