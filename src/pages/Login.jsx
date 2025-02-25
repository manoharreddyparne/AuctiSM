import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Row, Col, Alert, Spinner, Modal } from "react-bootstrap";
import { AuthContext } from "../utils/AuthContext";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Password Reset Modal
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // ✅ Check if User Needs to Set a Password
  useEffect(() => {
    const needsPassword = localStorage.getItem("needsPassword") === "true";
    if (needsPassword) {
      console.log("🔴 User needs to set a password. Showing reset modal.");
      setShowModal(true);
    }
  }, []);

  // ✅ Handle Manual Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("🔵 Attempting manual login with:", { email, password });

    const needsPassword = localStorage.getItem("needsPassword") === "true";
    if (needsPassword) {
      setError("Please reset your password first by logging in with Google.");
      setLoading(false);
      return; // Prevent manual login if password is not set
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("🟢 Login response received:", data);

      if (response.ok && data.token) {
        try {
          const decodedUser = jwtDecode(data.token);
          console.log("🟢 Decoded token:", decodedUser);

          if (!decodedUser.userId || !decodedUser.email) {
            console.error("❌ Decoded token missing required fields:", decodedUser);
            setError("Invalid token received. Please try again.");
            return;
          }

          // ✅ Store in Local Storage
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));

          // ✅ Update Auth Context
          login(data.token, data.user);
          navigate("/mainpage");
        } catch (decodeError) {
          console.error("❌ JWT Decode Error:", decodeError);
          setError("Token decoding failed. Please try again.");
        }
      } else {
        console.warn("⚠️ Login failed:", data);
        setError(data.message || "Login failed. Please try again.");
      }
    } catch (error) {
      console.error("🔴 Login failed:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Google Login
  const handleGoogleLogin = async (googleResponse) => {
    console.log("🔵 Google login received:", googleResponse);

    try {
      const response = await fetch("http://localhost:5000/api/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googleResponse.credential }),
      });

      const data = await response.json();
      console.log("🟣 Google login response:", data);

      if (data.token) {
        try {
          const decodedUser = jwtDecode(data.token);
          console.log("🟢 Decoded Google JWT:", decodedUser);

          if (!decodedUser.userId || !decodedUser.email) {
            console.error("❌ Google token missing required fields:", decodedUser);
            setError("Invalid Google token received. Please try again.");
            return;
          }

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));
          localStorage.setItem("email", data.user.email);

          login(data.token, data.user);

          if (data.needsPassword) {
            console.log("🟠 User needs to set a password - Showing reset modal...");
            setShowModal(true);
            localStorage.setItem("needsPassword", "true"); // ✅ Persist across logins
            return;
          }

          console.log("✅ Google login successful - Redirecting to mainpage...");
          navigate("/mainpage");
        } catch (decodeError) {
          console.error("❌ JWT Decode Error:", decodeError);
          setError("Failed to decode Google token.");
        }
      } else {
        console.warn("⚠️ Google login failed:", data);
        setError(data.message || "Google login failed.");
      }
    } catch (error) {
      console.error("🔴 Error in Google login:", error);
      setError("Something went wrong with Google login.");
    }
  };

  // ✅ Handle Password Reset for Google Users
  const handleSetPassword = async () => {
    console.log("🔵 Setting password for Google user...");
    try {
      const email = localStorage.getItem("email");
      if (!email) {
        setError("No email found. Try logging in again.");
        return;
      }

      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: newPassword }),
      });

      const data = await response.json();
      console.log("🔵 Password reset response:", data);

      if (response.ok) {
        alert("Password set successfully. You can now log in manually.");
        setShowModal(false);
        setNewPassword(""); // ✅ Reset state
        localStorage.removeItem("needsPassword"); // ✅ Remove flag after setting password
        navigate("/mainpage");
      } else {
        console.warn("⚠️ Password reset failed:", data);
        setError(data.message || "Error setting password.");
      }
    } catch (error) {
      console.error("🔴 Error in setting password:", error);
      setError("Something went wrong.");
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

          <div className="text-center mt-3">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                console.error("Google login failed");
                setError("Google login failed. Please try again.");
              }}
            />
          </div>

          {/* ✅ Password Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Set Your Password</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group>
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSetPassword}>Save Password</Button>
            </Modal.Footer>
          </Modal>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
