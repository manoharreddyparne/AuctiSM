import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import ResetPasswordModal from "../shared_components/ResetPasswordModal";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    dob: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      console.log("User already logged in, redirecting to main page...");
      navigate("/mainpage");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email format";
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = "Invalid phone number";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match";
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manual signup handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      console.log("Sending signup request...", formData);
      const response = await axios.post("http://localhost:5000/api/signup", formData);
      console.log("Signup successful:", response.data);
      localStorage.setItem("authToken", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
      navigate("/mainpage");
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({
        ...errors,
        email: error.response?.data?.message || "An unexpected error occurred",
      });
    }
  };

  // Google login handler
  const handleGoogleSuccess = async (response) => {
    console.log("Google authentication success:", response);
    try {
      const res = await axios.post("http://localhost:5000/api/google-login", {
        credential: response.credential,
      });
      console.log("Server response:", res.data);
      if (res.data.token) {
        localStorage.setItem("authToken", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        if (res.data.needsPassword) {
          console.log("🟠 New Google User - Showing Password Reset Modal...");
          setGoogleEmail(res.data.user.email);
          setShowPasswordModal(true);
        } else {
          console.log("🟢 Existing Google User - Redirecting to Main Page...");
          navigate("/mainpage");
        }
      }
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  // Callback for password reset from the modal
  const handlePasswordReset = async (newPassword) => {
    try {
      const res = await axios.post("http://localhost:5000/api/reset-password", {
        email: googleEmail,
        newPassword,
      });
      console.log("Password reset successful:", res.data);
      navigate("/mainpage");
    } catch (error) {
      console.error("Password reset failed:", error);
    }
  };

  return (
    <Container className="signup-container mt-4">
      <Row className="justify-content-md-center">
        <Col md={6}>
          <h2 className="text-center">Sign Up</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="fullName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                isInvalid={!!errors.fullName}
              />
              <Form.Control.Feedback type="invalid">
                {errors.fullName}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="phone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">
                {errors.phone}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="dob">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="address">
              <Form.Label>Address</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100 mt-3">
              Sign Up
            </Button>
          </Form>
          <p className="text-center mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </p>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => console.log("Google login failed")}
          />
        </Col>
      </Row>
      {showPasswordModal && (
        <ResetPasswordModal
          isOpen={showPasswordModal}
          userEmail={googleEmail}
          onClose={() => setShowPasswordModal(false)}
          onSubmitPassword={handlePasswordReset}
        />
      )}
    </Container>
  );
};

export default Signup;
