import React, { useState } from "react";
import { Routes, Route } from "react-router-dom"; // Removed extra Router
import Navbar from "./shared_components/Navbar"; // Navbar remains global
import DashboardRoutes from "./routes/DashboardRoutes"; // Default dashboard
import UserRoutes from "./routes/UserRoutes"; // Logged-in user routes
import PrivateRoute from "./utils/PrivateRoute"; // Private route protection
import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css"; // Global CSS

function App() {
  const [searchQuery, setSearchQuery] = useState("");

  // Check if user is authenticated (JWT in localStorage)
  const isAuthenticated = () => !!localStorage.getItem("token");

  return (
    <>
      {/* Global Background applied once */}
      <div className="global-background"></div>

      {/* Navbar remains outside Routes */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Routes without extra <Router> */}
      <Routes>
        {/* Public routes */}
        <Route path="/*" element={<DashboardRoutes />} />

        {/* Protected routes for authenticated users */}
        <Route
          path="/mainpage/*"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <UserRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
