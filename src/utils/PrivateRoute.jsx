import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, needsPassword } = useContext(AuthContext); // Access user and needsPassword from context
  const location = useLocation(); // Get current location for redirection
  const [authChecked, setAuthChecked] = useState(false); // Track authentication status

  useEffect(() => {
    console.log("🔍 Checking Private Route access...");
    console.log("User:", user);
    console.log("Loading:", loading);
    console.log("Current Path:", location.pathname);

    // If loading is done, check authentication status
    if (!loading) {
      setAuthChecked(true);
    }
  }, [user, loading, location]);

  // Show loading message until authentication status is checked
  if (!authChecked) {
    return <div className="text-center mt-5">🔄 Checking authentication...</div>;
  }

  // If user is authenticated, check if they need to set a password
  if (user) {
    console.log("🟢 User is authenticated:", user);

    if (needsPassword) {
      // Redirect to reset password if user has not set a password yet
      console.log("🔴 User needs to set a password. Redirecting to /reset-password...");
      return <Navigate to="/reset-password" state={{ from: location }} replace />;
    }

    // Allow access to protected routes if password is set
    return children;
  }

  // If user is not authenticated, redirect to login
  console.log("🔴 User is not authenticated. Redirecting to login...");
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
