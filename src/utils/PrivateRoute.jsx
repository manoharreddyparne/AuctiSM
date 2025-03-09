import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, needsPassword } = useContext(AuthContext);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Once the authentication status has been checked, update the state
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // If the authentication status has not been checked, display a loading message
  if (!authChecked) {
    return <div className="text-center mt-5">🔄 Checking authentication...</div>;
  }

  // If user is authenticated but needs to set a password, redirect to reset password
  if (user && needsPassword) {
    console.warn("🔴 User needs to set a password. Redirecting to /reset-password...");
    return <Navigate to="/reset-password" state={{ from: location }} replace />;
  }

  // If user is authenticated, display the children components
  if (user) {
    return children;
  }

  // If no user is authenticated, redirect to login
  console.warn("🔴 User is not authenticated. Redirecting to /login...");
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
