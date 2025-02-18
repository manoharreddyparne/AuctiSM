import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom"; // Import useNavigate
import { Navbar, Nav, Container, Form, Button } from "react-bootstrap";
import { FaSearch } from "react-icons/fa";
import logo from "../../assets/images/logo.png"; // Ensure the path is correct
import "./Navbar.css";

const CustomNavbar = ({ searchQuery, setSearchQuery }) => {
  const navigate = useNavigate(); // Use navigate for programmatic navigation

  const handleSearchChange = (event) => setSearchQuery(event.target.value);

  const handleSearch = (event) => {
    if (event.key === "Enter" || event.type === "click") {
      if (searchQuery.trim()) {
        // Simulate a search result check (replace with real search logic)
        const results = []; // Empty array simulating no results (replace this with real data fetch logic)
  
        if (results.length === 0) {
          navigate("/404", { state: { searchQuery } }); // Navigate to 404 with search query
        } else {
          navigate(`/?search=${searchQuery}`); // Otherwise, navigate with the search query in the URL
        }
      }
    }
  };

  return (
    <Navbar expand="lg" className="px-3 shadow-sm navbar-custom">
      <Container>
        {/* Logo */}
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt="AuctiSM Logo" className="navbar-logo" />
        </Navbar.Brand>

        {/* Mobile Toggle Button */}
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

          {/* Login & Signup Buttons */}
          <div className="auth-buttons">
            <Button as={Link} to="/login" variant="outline-primary" className="btn-custom mx-2">
              Login
            </Button>
            <Button as={Link} to="/signup" variant="primary" className="btn-custom">
              Signup
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
