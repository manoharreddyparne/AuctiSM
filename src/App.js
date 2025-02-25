import React, { useContext, useEffect } from "react";
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
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    console.log("🔍 Checking App.js render...");
    console.log("User:", user);
    console.log("Loading:", loading);
  }, [user, loading]);

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="global-background"></div>

      {loading ? (
        <div className="text-center mt-5">🔄 Loading...</div>
      ) : user ? (
        <UserNavbar />
      ) : (
        <Navbar />
      )}

      <Routes>
        <Route path="/*" element={<DashboardRoutes />} />
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
