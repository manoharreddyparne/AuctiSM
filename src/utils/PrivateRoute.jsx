import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, needsPassword } = useContext(AuthContext);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {

    if (!loading) {
      setAuthChecked(true);
    }
  }, [loading]);

  if (!authChecked) {
    return <div className="text-center mt-5">🔄 Checking authentication...</div>;
  }

  if (user && needsPassword) {
    console.warn("🔴 User needs to set a password. Redirecting to /reset-password...");
    return <Navigate to="/reset-password" state={{ from: location }} replace />;
  }

  if (user) {
    return children;
  }


  console.warn("🔴 User is not authenticated. Redirecting to /login...");
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;
