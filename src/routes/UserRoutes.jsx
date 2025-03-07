// src/routes/UserRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "../users_dashboard/MainPage";
import Profile from "../users_dashboard/Profile";
import Auctions from "../users_dashboard/Auctions";
import SellerDashboard from "../seller/components/SellerDashboard";
import AuctionDetail from "../seller/pages/AuctionDetail";
import Error404Page from "../pages/404ErrorPage";

function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="profile" element={<Profile />} /> 
      <Route path="auctions" element={<Auctions />} /> 
      {/* This route shows both the Create Auction form and list of auctions */}
      <Route path="my-auctions" element={<SellerDashboard />} /> 
      {/* This route displays full details for a selected auction */}
      <Route path="my-auctions/:auctionId" element={<AuctionDetail />} />
      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}

export default UserRoutes;
