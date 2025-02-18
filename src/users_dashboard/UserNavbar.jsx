import React from "react";
import Navbar from "../shared_components/Navbar"; // Import the shared Navbar

const UserNavbar = () => {
  return <Navbar isLoggedIn={false} />; // Pass isLoggedIn prop
};

export default UserNavbar;
