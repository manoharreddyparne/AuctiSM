// src/routes/UserRoutes.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "../users_dashboard/MainPage";
import Profile from "../users_dashboard/Profile";
import Auctions from "../users_dashboard/Auctions";
import SellerDashboard from "../seller/components/SellerDashboard";
import AuctionDetail from "../seller/pages/AuctionDetail";
import AuctionDetailParticipant from "../users_dashboard/AuctionDetailParticipant"; // ✅ Import Participant's Auction Detail Page
import AuctionRegister from "../seller/pages/AuctionRegister"; // ✅ Import Auction Register Page
import Error404Page from "../pages/404ErrorPage";

function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="profile" element={<Profile />} />
      <Route path="auctions" element={<Auctions />} />
      <Route path="my-auctions" element={<SellerDashboard />} />
      <Route path="my-auctions/:auctionId" element={<AuctionDetail />} />

      {/* ✅ Add this route for the auction registration page */}
      <Route path="auction-register/:auctionId" element={<AuctionRegister />} />

      {/* ✅ Add Participant's Auction Detail Page Route */}
      <Route path="auction-detail/:auctionId" element={<AuctionDetailParticipant />} />

      <Route path="*" element={<Error404Page />} />
    </Routes>
  );
}

export default UserRoutes;
