// utils/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated()) {
    // If user is not authenticated, redirect to login page
    return <Navigate to="/login" />;
  }
  return children; // If authenticated, render the children components
};

export default PrivateRoute;
