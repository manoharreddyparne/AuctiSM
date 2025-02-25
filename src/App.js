import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./shared_components/Navbar";
import UserNavbar from "./users_dashboard/UserNavbar";
import DashboardRoutes from "./routes/DashboardRoutes";
import UserRoutes from "./routes/UserRoutes";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthContext } from "./utils/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="global-background"></div>
      {/* ✅ Fix: Conditional Rendering for Navbar */}
      {user ? <UserNavbar /> : <Navbar />}

      <Routes>
        {/* ✅ Main Dashboard Routes */}
        <Route path="/*" element={<DashboardRoutes />} />

        {/* ✅ User Routes (Protected) */}
        <Route
          path="/mainpage/*"
          element={
            <PrivateRoute>
              <UserRoutes />
            </PrivateRoute>
          }
        />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
