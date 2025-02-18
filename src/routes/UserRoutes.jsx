import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "../users_dashboard/MainPage"; // MainPage for logged-in users
import Profile from "../users_dashboard/Profile"; // User Profile page
import Auctions from "../users_dashboard/Auctions"; // Auctions for logged-in users
import Error404Page from "../pages/404ErrorPage"; // Error page for unmatched routes

function UserRoutes() {
  return (
    <Routes>
      {/* Main Page for logged-in users */}
      <Route path="/mainpage" element={<MainPage />} /> {/* This will render MainPage on '/' */}
      <Route path="/profile" element={<Profile />} />
      <Route path="/auctions" element={<Auctions />} />
      <Route path="*" element={<Error404Page />} /> {/* Catch-all route */}
    </Routes>
  );
}

export default UserRoutes;
