// src/routes/DashboardRoutes.jsx
import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext"; // Import AuthContext
import Home from "../default_dashboard/jsx/Home"; // Home page for non-logged-in users
import Contact from "../pages/Contact";
import GetStarted from "../pages/GetStarted";
import Help from "../pages/Help";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Error404Page from "../pages/404ErrorPage";
import Auctions from "../default_dashboard/jsx/Auctions";
import Guidance from "../default_dashboard/jsx/Guidance";

function DashboardRoutes() {
  const { user } = useContext(AuthContext); // Get user state

  return (
    <Routes>
      {/* If user is logged in, "/" should redirect to /mainpage */}
      <Route path="/" element={user ? <Navigate to="/mainpage" /> : <Home />} />
      <Route path="/home" element={user ? <Navigate to="/mainpage" /> : <Home />} />

      <Route path="/auctions" element={<Auctions />} />
      <Route path="/guidance" element={<Guidance />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/get-started" element={<GetStarted />} />
      <Route path="/help" element={<Help />} />

      {/* Prevent logged-in users from accessing login/signup */}
      <Route path="/login" element={user ? <Navigate to="/mainpage" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/mainpage" /> : <Signup />} />

      {/* Catch-all route */}
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}

export default DashboardRoutes;
