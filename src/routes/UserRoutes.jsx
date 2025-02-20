import React from "react";
import { Routes, Route } from "react-router-dom";
import MainPage from "../users_dashboard/MainPage"; 
import Profile from "../users_dashboard/Profile";
import Auctions from "../users_dashboard/Auctions";
import Error404Page from "../pages/404ErrorPage";

function UserRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} /> {/* Matches "/mainpage" */}
      <Route path="profile" element={<Profile />} /> {/* Matches "/mainpage/profile" */}
      <Route path="auctions" element={<Auctions />} /> {/* Matches "/mainpage/auctions" */}
      <Route path="*" element={<Error404Page />} /> {/* Matches "/mainpage/*" */}
    </Routes>
  );
}

export default UserRoutes;
