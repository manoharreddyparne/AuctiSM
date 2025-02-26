import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, needsPassword } = useContext(AuthContext);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // When loading is finished, mark authentication as checked
    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  // While checking authentication status, show a loading indicator
  if (!authChecked) {
    return <div className="text-center mt-5">🔄 Checking authentication...</div>;
  }

  // If user is authenticated but needs to reset password, redirect them to reset-password page
  if (user && needsPassword) {
    console.warn("🔴 User needs to set a password. Redirecting to /reset-password...");
    return <Navigate to="/reset-password" state={{ from: location }} replace />;
  }

  // If user is authenticated and does not need to reset password, allow access to protected routes
  if (user) {
    return children;
  }

  // If no user is authenticated, redirect to login
  console.warn("🔴 User is not authenticated. Redirecting to /login...");
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
