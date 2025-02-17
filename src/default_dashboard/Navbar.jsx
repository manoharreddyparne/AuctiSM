import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Navbar.css"; // Custom styling (if necessary)
import logo from "../assets/images/logo.png"; // Ensure this path is correct

const CustomNavbar = () => {
  return (
    <Navbar expand="lg" bg="dark" variant="dark" sticky="top" className="px-3">
      <Container fluid>
        {/* Left - Logo */}
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <img src={logo} alt="AuctiSM Logo" className="navbar-logo" />
        </Navbar.Brand>

        {/* Navbar Toggler for Mobile */}
        <Navbar.Toggle aria-controls="navbarNav" />

        {/* Center - Navbar Links */}
        <Navbar.Collapse id="navbarNav" className="justify-content-center">
          <Nav className="mx-auto">
            <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
            <Nav.Link as={Link} to="/auctions" className="mx-2">Auctions</Nav.Link>
            <Nav.Link as={Link} to="/guidance" className="mx-2">Guidance</Nav.Link>
            <Nav.Link as={Link} to="/contact" className="mx-2">Contact</Nav.Link>
            <Nav.Link as={Link} to="/get-started" className="mx-2">Get Started</Nav.Link>
            <Nav.Link as={Link} to="/help" className="mx-2">Help</Nav.Link>
          </Nav>
        </Navbar.Collapse>

        {/* Right - Login & Signup */}
        <div className="d-flex gap-2">
          <Button as={Link} to="/login" variant="outline-light" size="sm">Login</Button>
          <Button as={Link} to="/signup" variant="warning" size="sm">Signup</Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default CustomNavbar;
