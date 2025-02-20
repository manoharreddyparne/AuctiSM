import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../utils/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="text-center mt-5">Checking authentication...</div>;
  }

  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
