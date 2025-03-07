import React from "react";
import "./LoadingOverlay.css";

const LoadingOverlay = ({ message = "Please wait..." }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
};

export default LoadingOverlay;
