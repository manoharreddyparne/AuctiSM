import React from "react";
import { Link } from "react-router-dom"; // Import Link
import "./Navbar.css";
import logo from "../assets/images/logo.png";
function Navbar() {
  return (
    <nav className="navbar">
      {/* Left Section: Logo */}
      <div className="navbar-left">
        <img src={logo} alt="AuctiSM Logo" className="navbar-logo" />
      </div>

      {/* Centered Title */}
      <h2 className="navbar-title">AuctiSM</h2>

      {/* Right Section: Links + Auth */}
      <div className="navbar-right">
        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/auctions">Auctions</Link>
          <Link to="/guidance">Guidance</Link>
          <Link to="/contact">Contact</Link>
          <Link to="/get-started">Get Started</Link>
          <Link to="/help">Help</Link>
        </div>

        <div className="navbar-auth">
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
