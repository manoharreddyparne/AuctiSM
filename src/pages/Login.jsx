import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Container,
  Row,
  Col,
  Alert,
  Spinner
} from "react-bootstrap";
import { AuthContext } from "../utils/AuthContext";
// Use a named import for jwtDecode – ensure your package exports it as such
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import ResetPasswordModal from "../shared_components/ResetPasswordModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // State to control the ResetPasswordModal (used only for Google login when needed)
  const [showModal, setShowModal] = useState(false);
  // Store the email for which password reset applies (from Google login)
  const [modalEmail, setModalEmail] = useState("");

  // On component mount, check if the "needsPassword" flag (from backend/localStorage) indicates a reset is required.
  useEffect(() => {
    const needsPasswordFlag = localStorage.getItem("needsPassword") === "true";
    if (needsPasswordFlag) {
      console.log("🔴 User needs to set a password. Showing reset modal.");
      setShowModal(true);
    }
  }, []);

  // Handler for manual login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("🔵 Attempting manual login:", { email, password });

    // If the flag indicates a password reset is required, block manual login.
    if (localStorage.getItem("needsPassword") === "true") {
      setError("Please reset your password first by logging in with Google.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await response.json();
      console.log("🟢 Login response:", data);

      if (response.ok && data.token) {
        try {
          const decodedUser = jwtDecode(data.token);
          console.log("🟢 Decoded token:", decodedUser);
          if (!decodedUser.userId || !decodedUser.email) {
            throw new Error("Invalid token received.");
          }
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));
          login(data.token, data.user);
          navigate("/mainpage");
        } catch (decodeError) {
          console.error("❌ JWT Decode Error:", decodeError);
          setError("Invalid session. Please try again.");
        }
      } else {
        setError(data.message || "Login failed.");
      }
    } catch (err) {
      console.error("🔴 Login error:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handler for Google login
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
            throw new Error("Invalid Google token.");
          }
          // Persist token, user details, and email
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));
          localStorage.setItem("email", data.user.email);
          setModalEmail(data.user.email);
          login(data.token, data.user);

          // If backend indicates that the user needs to set a password,
          // show the ResetPasswordModal and persist the flag.
          if (data.needsPassword) {
            console.log("🟠 Google user needs to set a password - showing reset modal.");
            setShowModal(true);
            localStorage.setItem("needsPassword", "true");
            return;
          }
          console.log("✅ Google login successful - redirecting to mainpage.");
          navigate("/mainpage");
        } catch (decodeError) {
          console.error("❌ JWT Decode Error:", decodeError);
          setError("Failed to decode Google token.");
        }
      } else {
        setError(data.message || "Google login failed.");
      }
    } catch (err) {
      console.error("🔴 Google login error:", err);
      setError("Something went wrong with Google login.");
    }
  };

  // Handler for setting/resetting the password via the ResetPasswordModal.
  // This function receives the new password value from the modal.
  const handlePasswordReset = async (newPasswordValue) => {
    console.log("🔵 Resetting password for user...");
    try {
      if (!modalEmail) {
        setError("No email found. Please try logging in again.");
        return;
      }
      const response = await fetch("http://localhost:5000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: modalEmail, newPassword: newPasswordValue }),
      });
      const data = await response.json();
      console.log("🔵 Password reset response:", data);
      if (response.ok) {
        alert("Password set successfully. You can now log in manually.");
        setShowModal(false);
        localStorage.removeItem("needsPassword");
        navigate("/mainpage");
      } else {
        setError(data.message || "Error setting password.");
      }
    } catch (err) {
      console.error("🔴 Password reset error:", err);
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
              onError={() => setError("Google login failed. Please try again.")}
            />
          </div>
          {showModal && (
            <ResetPasswordModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              userEmail={modalEmail}
              onSubmitPassword={handlePasswordReset}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
