import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../utils/AuthContext";
import { jwtDecode } from "jwt-decode"; // Correct import

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext); // Use login function instead of setUser
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      setLoading(false);
      console.log("Login response:", data);

      if (response.ok) {
        localStorage.setItem("authToken", data.token);

        // Decode token to extract user info
        const decodedUser = jwtDecode(data.token);
        console.log("Decoded token:", decodedUser);

        // Update AuthContext with login function
        login(data.token);

        console.log("User set in context:", { id: decodedUser.userId, email: decodedUser.email });

        navigate("/mainpage"); // Redirect after login
      } else {
        setError(data.message || "Invalid credentials");
        localStorage.removeItem("authToken");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center">Login</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit} autoComplete="on">
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100" disabled={loading}>
              {loading ? <Spinner animation="border" size="sm" /> : "Login"}
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
