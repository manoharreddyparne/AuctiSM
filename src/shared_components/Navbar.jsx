
import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button } from "react-bootstrap";
import { FaSearch, FaMoon, FaSun } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import "./Navbar.css";

const CustomNavbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const [inputError, setInputError] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "enabled"
  );

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", newMode ? "enabled" : "disabled");
    document.body.classList.toggle("dark-mode", newMode);
  };

  // Apply dark mode on page load
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleSearchChange = (event) => {
    const trimmedValue = event.target.value.trim();
    setSearchQuery(trimmedValue);
    if (inputError) setInputError(false);
  };

  const handleSearch = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      if (!searchQuery) {
        setInputError(true);
        setTimeout(() => setInputError(false), 1500);
        return;
      }
      navigate(`/?search=${searchQuery}`);
    }
  };

  return (
    <Navbar expand="lg" className="px-3 shadow-sm navbar-custom">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="AuctiSM Logo" className="navbar-logo" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            {[
              { path: "/", label: "Home" },
              { path: "/auctions", label: "Auctions" },
              { path: "/guidance", label: "Guidance" },
              { path: "/contact", label: "Contact" },
              { path: "/get-started", label: "Get Started" },
              { path: "/help", label: "Help" },
            ].map(({ path, label }, index) => (
              <NavLink
                key={index}
                to={path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
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
              placeholder="Search..."
              className={`search-input ${inputError ? "error" : ""}`}
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleSearch}
            />
          </Form>

          {/* Authentication Buttons */}
          <div className="auth-buttons">
            {isLoggedIn ? (
              <>
                <Button as={Link} to="/profile" variant="outline-primary" className="btn-custom">
                  Profile
                </Button>
                <Button as={Link} to="/logout" variant="primary" className="btn-custom">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button as={Link} to="/login" variant="outline-primary" className="btn-custom">
                  Login
                </Button>
                <Button as={Link} to="/signup" variant="primary" className="btn-custom">
                  Signup
                </Button>
              </>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
