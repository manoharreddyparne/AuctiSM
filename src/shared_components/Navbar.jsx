// shared_components/Navbar.jsx
import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import logo from "../assets/images/logo.png"; // Ensure the path is correct
import "./Navbar.css";

const CustomNavbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate();

  // Check if the user is authenticated (based on token in localStorage)
  const isLoggedIn = localStorage.getItem("token") ? true : false;

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const handleSearch = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      if (searchQuery.trim()) {
        const results = [];
        if (results.length === 0) {
          navigate("/404", { state: { searchQuery } });
        } else {
          navigate(`/?search=${searchQuery}`);
        }
      }
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
            {["/", "/auctions", "/guidance", "/contact", "/get-started", "/help"].map((path, index) => (
              <NavLink
                key={index}
                to={path}
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                {path.replace("/", "").toUpperCase() || "Home"}
              </NavLink>
            ))}
          </Nav>

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

          {/* Conditionally render Profile & Logout Buttons if logged in */}
          {isLoggedIn && (
            <div className="auth-buttons">
              <Button as={Link} to="/profile" variant="outline-primary" className="btn-custom mx-2">
                Profile
              </Button>
              <Button as={Link} to="/logout" variant="primary" className="btn-custom">
                Logout
              </Button>
            </div>
          )}

          {/* Conditionally render Login & Signup Buttons if not logged in */}
          {!isLoggedIn && (
            <div className="auth-buttons">
              <Button as={Link} to="/login" variant="outline-primary" className="btn-custom mx-2">
                Login
              </Button>
              <Button as={Link} to="/signup" variant="primary" className="btn-custom">
                Signup
              </Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
