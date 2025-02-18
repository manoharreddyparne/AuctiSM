import React from "react";
import UserNavbar from "./UserNavbar"; // Import UserNavbar
import { Link } from "react-router-dom";

function MainPage() {
  // Simulate logged-in state for testing
  const isLoggedIn = true; // Simulate logged-in state here

  return (
    <div>
      <UserNavbar isLoggedIn={isLoggedIn} />
      <h1>Welcome to your main page, user!</h1>
      <p>This is your dashboard.</p>
      <Link to="/profile">Go to Profile</Link>
      <Link to="/auctions">View Auctions</Link>
    </div>
  );
}

export default MainPage;
