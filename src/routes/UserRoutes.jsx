import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "../users_dashboard/MainPage";
import Profile from "../users_dashboard/Profile";
import Auctions from "../users_dashboard/Auctions";
import SellerDashboard from "../seller/components/SellerDashboard"
import Error404Page from "../pages/404ErrorPage";

function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="profile" element={<Profile />} /> 
      <Route path="auctions" element={<Auctions />} /> 
      <Route path="my-auctions" element={<SellerDashboard />} /> 
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}

export default UserRoutes;
