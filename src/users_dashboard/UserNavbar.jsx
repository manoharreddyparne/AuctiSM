
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button } from "react-bootstrap";
import { FaSearch, FaMoon, FaSun } from "react-icons/fa"; 
import logo from "../assets/images/logo.png";
import "./UserNavbar.css";

const UserNavbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "enabled"
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
    document.body.classList.toggle("dark-mode", newMode);
  };


  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const handleSearch = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      if (searchQuery.trim()) {
        navigate(`/?search=${searchQuery}`);
      }
    }
  };

  return (
    <Navbar expand="lg" className="px-3 shadow-sm user-navbar">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/mainpage">
          <img src={logo} alt="AuctiSM Logo" className="user-navbar-logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="user-navbar-nav" />
        <Navbar.Collapse id="user-navbar-nav">
          {/* Navigation Links */}
          <Nav className="me-auto">
            {[
              { path: "/mainpage", label: "HOME", exact: true },
              { path: "/mainpage/auctions", label: "Auctions" },
              { path: "/mainpage/profile", label: "Profile" },
              { path: "/mainpage/guidance", label: "Guidance" },
              { path: "/mainpage/help", label: "Help" },
              { path: "/mainpage/contact", label: "Contact" },
              { path: "/mainpage/my-auctions", label: "My Auctions" },
               // New "My Auctions" button
            ].map(({ path, label }, index) => (
              <NavLink
                key={index}
                to={path}
                end={path === "/mainpage"} // Only active on exact path match
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
              >
                {label}
              </NavLink>

            ))}
          </Nav>

          {/* Dark Mode Toggle */}
          <div className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? <FaSun className="toggle-icon sun" /> : <FaMoon className="toggle-icon moon" />}
          </div>

          {/* Search Bar */}
          <Form className="search-form">
            <FaSearch className="search-icon" onClick={handleSearch} />
            <input
              type="text"
              name="search"
              placeholder="Search..."
              className="search-input"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearch}
            />
          </Form>

          {/* Profile & Logout buttons (Only visible when user is logged in) */}
          {isLoggedIn && (
            <div className="auth-buttons">
              <Button as={Link} to="/mainpage/profile" variant="outline-primary" className="btn-custom">
                Profile
              </Button>
              <Button as={Link} to="/logout" variant="primary" className="btn-custom">
                Logout
              </Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default UserNavbar;
