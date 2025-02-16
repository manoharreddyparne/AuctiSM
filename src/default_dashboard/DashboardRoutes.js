import React from "react";
import { Routes, Route } from "react-router-dom";

// ✅ Import moved pages from default_dashboard
import Home from "./Home";
import Auctions from "./Auctions";
import Guidance from "./Guidance";

// ✅ Other pages remain in pages/
import Contact from "../pages/Contact";
import GetStarted from "../pages/GetStarted";
import Help from "../pages/Help";
import Login from "../pages/Login";
import Signup from "../pages/Signup";

function DashboardRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auctions" element={<Auctions />} />
      <Route path="/guidance" element={<Guidance />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
    </Routes>
  );
}

export default DashboardRoutes;
