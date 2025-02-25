import React, { useContext, useEffect, useState } from "react";
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
import ResetPasswordModal from "./shared_components/ResetPasswordModal"; // Ensure this is the correct path

function App() {
  const { user, loading, needsPassword } = useContext(AuthContext); // Access context for user and needsPassword
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  useEffect(() => {
    console.log("🔍 Checking App.js render...");
    console.log("User:", user);
    console.log("Needs Password:", needsPassword);
    console.log("Show Reset Password Modal:", showResetPasswordModal);
    
    if (user && needsPassword) {
      setShowResetPasswordModal(true);
    } else {
      setShowResetPasswordModal(false);
    }
  }, [user, needsPassword, showResetPasswordModal]);
  

  // Loading state handling
  if (loading) {
    return <div className="text-center mt-5">🔄 Loading...</div>;
  }

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="global-background"></div>

      {/* Navbar based on user login */}
      {user ? <UserNavbar /> : <Navbar />}

      {/* Main Routes */}
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
        <Route
          path="/reset-password"
          element={
            user && needsPassword ? (
              <ResetPasswordModal /> // Only show modal if the user needs to reset password
            ) : (
              <Navigate to="/mainpage" /> // Redirect to main page if no reset is needed
            )
          }
        />
      </Routes>

      {/* Show reset password modal if required */}
      {showResetPasswordModal && (
        <ResetPasswordModal /> // Ensure this modal is only shown when needed
      )}
    </GoogleOAuthProvider>
  );
}

export default App;
// ✅ Check Password Reset Modal