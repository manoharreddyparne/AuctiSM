import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios"; // Import Axios

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

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate form fields
  const validateForm = () => {
    let newErrors = {};
  
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.includes("@")) newErrors.email = "Invalid email format";
    if (formData.phone.length !== 10) newErrors.phone = "Invalid phone number";
  
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
  
    if (formData.password !== formData.confirmPassword) {
      newErrors.password = "Passwords do not match";
      newErrors.confirmPassword = "Passwords do not match";
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  

  // Handle signup form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await axios.post("http://localhost:5000/api/signup", formData);
  
        console.log("Signup successful:", response.data);
  
        // Store token in localStorage
        localStorage.setItem("authToken", response.data.token);
  
        // Set Axios global default header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
  
        // Redirect to dashboard or main page
        navigate("/mainpage");
      } catch (error) {
        console.error("Error during signup:", error);
        if (error.response) {
          setErrors({ ...errors, email: error.response.data.message });
        } else {
          setErrors({ ...errors, email: "An unexpected error occurred" });
        }
      }
    }
  };
  

  // Handle Google login

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post("http://localhost:5000/api/google-login", {
        tokenId: response.credential, // Google response token
      });
  
      console.log("Google Login Success:", res.data);
  
      // Store token in localStorage
      localStorage.setItem("authToken", res.data.token);
  
      // Set Axios global default header
      axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
  
      // Redirect to dashboard
      navigate("/mainpage");
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };
  
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Container className="signup-container mt-4">
        <Row className="justify-content-md-center">
          <Col md={6}>
            <h2 className="text-center">Sign Up</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
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

              <Form.Group>
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

              <Form.Group>
                <Form.Label>Phone Number</Form.Label>
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

              <Form.Group>
                <Form.Label>Date of Birth</Form.Label>
                <Form.Control
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group>
                <Form.Label>Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group>
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

              <Form.Group>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="mt-3 w-100">
                Sign Up
              </Button>
            </Form>

            <p className="text-center mt-3">
              Already have an account? <Link to="/login">Login</Link>
            </p>

            {/* Google Login button */}
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log("Google login failed")} />
          </Col>
        </Row>
      </Container>
    </GoogleOAuthProvider>
  );
};

export default Signup;
