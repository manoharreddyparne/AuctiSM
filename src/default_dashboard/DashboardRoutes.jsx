import React from "react";
import { Routes, Route } from "react-router-dom";

// ✅ Import pages from the default_dashboard folder
import Home from "./Home";
import Auctions from "./Auctions";
import Guidance from "./Guidance";

// ✅ Other pages remain in the pages folder
import Contact from "../pages/Contact";
import GetStarted from "../pages/GetStarted";
import Help from "../pages/Help";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

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

      {/* Fallback Route for 404 */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default DashboardRoutes;
