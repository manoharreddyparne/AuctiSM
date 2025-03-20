import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
import SellerDashboard from "./seller/components/SellerDashboard";
import CreateAuction from "./seller/components/CreateAuction";
import AuctionDetail from "./seller/pages/AuctionDetail";
import AuctionDetailParticipant from "./users_dashboard/AuctionDetailParticipant";
import AuctionRegister from "./seller/pages/AuctionRegister";

import AdminRoutes from "./admin/routes/AdminRoutes";
function App() {
  const { user, loading, needsPassword, setNeedsPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");
  useEffect(() => {
    const interval = setInterval(() => {
      const storedDark = localStorage.getItem("darkMode") === "enabled";
      if (storedDark !== darkMode) {
        setDarkMode(storedDark);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [darkMode]);

  useEffect(() => {

  }, [user, needsPassword]);

  if (loading) {
    return <div className="text-center mt-5">🔄 Loading...</div>;
  }

  const handleModalClose = () => {
    localStorage.setItem("needsPassword", "false");
    setNeedsPassword(false);
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      let userObj = JSON.parse(storedUser);
      if (userObj.needsPassword) {
        delete userObj.needsPassword;
        localStorage.setItem("user", JSON.stringify(userObj));
      }
    }
    navigate("/mainpage", { replace: true });
  };

  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className={`global-background ${darkMode ? "dark" : "light"}`}></div>
      {user ? <UserNavbar /> : <Navbar />}
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
          path="/mainpage/my-auctions"
          element={
            <PrivateRoute>
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/mainpage/my-auctions/:auctionId"
          element={
            <PrivateRoute>
              <AuctionDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-auction"
          element={
            <PrivateRoute>
              <CreateAuction />
            </PrivateRoute>
          }
        />
        <Route
          path="/auction-detail/:auctionId"
          element={
            <PrivateRoute>
              <AuctionDetailParticipant />
            </PrivateRoute>
          }
        />
        <Route
          path="/auction-register/:auctionId"
          element={
            <PrivateRoute>
              <AuctionRegister />
            </PrivateRoute>
          }
          
        />
          <Route path="/admin/*" element={<AdminRoutes />} />
        <Route
          path="/reset-password"
          element={
            user && needsPassword ? (
              <ResetPasswordModal
                isOpen={true}
                userEmail={user.email}
                onClose={handleModalClose}
                onSubmitPassword={async (newPassword) => {
                  try {
                    const payload = { email: user.email, password: newPassword };
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/set-password`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const data = await response.json();
                    if (response.ok) {
                      handleModalClose();
                    } else {
                      throw new Error(data.message || "Error resetting password.");
                    }
                  } catch (error) {
                    alert(error.message);
                  }
                }}
              />
            ) : (
              <Navigate to="/mainpage" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to={user ? "/mainpage" : "/"} replace />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
