import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminLogin from "../pages/AdminLogin"; // Import the Admin Login page

const AdminRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<AdminLogin />} />
      {/* Add more admin routes here later */}
    </Routes>
  );
};

export default AdminRoutes;
