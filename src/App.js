import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./shared_components/Navbar";
import UserNavbar from "./users_dashboard/UserNavbar";
import DashboardRoutes from "./routes/DashboardRoutes";
import UserRoutes from "./routes/UserRoutes";
import PrivateRoute from "./utils/PrivateRoute";
import { AuthContext } from "./utils/AuthContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "bootstrap/dist/css/bootstrap.min.css";
import "./global.css";
import ResetPasswordModal from "./shared_components/ResetPasswordModal";

function App() {
  const { user, loading, needsPassword } = useContext(AuthContext);

  useEffect(() => {
    console.log("App.js render:");
    console.log("User:", user);
    console.log("Needs Password:", needsPassword);
  }, [user, needsPassword]);

  if (loading) {
    return <div className="text-center mt-5">🔄 Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="global-background"></div>

      {/* Render Navbar based on authentication status */}
      {user ? <UserNavbar /> : <Navbar />}

      <Routes>
        {/* Public Dashboard Routes */}
        <Route path="/*" element={<DashboardRoutes />} />

        {/* Protected Routes */}
        <Route
          path="/mainpage/*"
          element={
            <PrivateRoute>
              <UserRoutes />
            </PrivateRoute>
          }
        />

        {/* Password Reset Route */}
        <Route
          path="/reset-password"
          element={
            user && needsPassword ? (
              <ResetPasswordModal />
            ) : (
              <Navigate to="/mainpage" replace />
            )
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={user ? "/mainpage" : "/"} replace />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
