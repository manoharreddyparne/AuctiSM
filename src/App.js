import React, { useContext, useEffect } from "react";
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

function App() {
  const { user, loading, needsPassword, setNeedsPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    // Optional debugging:
    // console.log("User:", user);
    // console.log("Needs Password:", needsPassword);
  }, [user, needsPassword]);

  if (loading) {
    return <div className="text-center mt-5">🔄 Loading...</div>;
  }

  // onClose callback for the ResetPasswordModal:
  const handleModalClose = () => {
    // Clear the password reset flag in both localStorage and context.
    localStorage.setItem("needsPassword", "false");
    setNeedsPassword(false);

    // Optionally update the stored user to remove the needsPassword property.
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
      <div className="global-background"></div>
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

        {/* Seller Routes */}
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

        {/* Participant Auction Detail Route */}
        <Route
          path="/auction-detail/:auctionId"
          element={
            <PrivateRoute>
              <AuctionDetailParticipant />
            </PrivateRoute>
          }
        />

        {/* Auction Registration Route */}
        <Route
          path="/auction-register/:auctionId"
          element={
            <PrivateRoute>
              <AuctionRegister />
            </PrivateRoute>
          }
        />

        {/* Password Reset Route */}
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
                    // Build payload with email and new password.
                    const payload = {
                      email: user.email,
                      password: newPassword,
                    };
                    console.log("Submitting new password with payload:", payload);

                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/set-password`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    const data = await response.json();
                    console.log("Reset password response:", data);

                    if (response.ok) {
                      // On success, clear the flag and navigate away.
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

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={user ? "/mainpage" : "/"} replace />} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
