import React, { useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    console.log("🔍 Checking Private Route access...");
    console.log("User:", user);
    console.log("Loading:", loading);
    console.log("Current Path:", location.pathname);

    if (!loading) {
      setAuthChecked(true);
    }
  }, [user, loading, location]);

  if (!authChecked) {
    return <div className="text-center mt-5">🔄 Checking authentication...</div>;
  }

  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;
