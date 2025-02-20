import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./shared_components/Navbar";
import UserNavbar from "./users_dashboard/UserNavbar"; // ✅ Import UserNavbar
import DashboardRoutes from "./routes/DashboardRoutes";
import UserRoutes from "./routes/UserRoutes";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthContext } from "./utils/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";

function App() {
  const { user } = useContext(AuthContext); // ✅ Get user from context

  return (
    <>
      <div className="global-background"></div>

      {/* ✅ Show UserNavbar after login, otherwise Navbar */}
      {user ? <UserNavbar /> : <Navbar />}

      <Routes>
        {/* ✅ Public routes (before login) */}
        <Route path="/*" element={<DashboardRoutes />} />

        {/* ✅ Private routes (after login) */}
        <Route
          path="/mainpage/*"
          element={
            <PrivateRoute>
              <UserRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
