import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Container, Row, Col, Alert, Spinner } from "react-bootstrap";
import { AuthContext } from "../utils/AuthContext";
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

  const [showModal, setShowModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    console.log("🔵 Attempting manual login with:", { email, password });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("🟢 Manual login response received:", data);

      console.log("DEBUG: data.needsPassword =", data.needsPassword);
      console.log("DEBUG: data.user?.needsPassword =", data.user ? data.user.needsPassword : undefined);

      if (response.ok && data.token) {
        try {
          const decodedUser = jwtDecode(data.token);
          console.log("🟢 Decoded token:", decodedUser);
          if (
            (data.message && data.message.includes("reset")) ||
            data.needsPassword === true ||
            (data.user && data.user.needsPassword === true)
          ) {
            console.warn("🔴 Manual login: Password reset required. Please use Google sign-in.");
            setError("Password not set. Please log in with Google and reset your password.");
            return;
          }

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(data.user || {}));
          login(data.token, data.user);
          navigate("/mainpage");
        } catch (decodeError) {
          console.error("❌ JWT Decode Error:", decodeError);
          setError("Token decoding failed. Please try again.");
        }
      } else {
        console.warn("⚠️ Manual login failed:", data);
        setError(data.message || "Login failed. Please try again.");
        localStorage.removeItem("authToken");
      }
    } catch (err) {
      console.error("🔴 Manual login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (googleResponse) => {
    console.log("🔵 Google login received:", googleResponse);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: googleResponse.credential }),
      });

      const data = await response.json();
      console.log("🟣 Google login response:", data);

      console.log("DEBUG: data.needsPassword =", data.needsPassword);
      console.log("DEBUG: data.user?.needsPassword =", data.user ? data.user.needsPassword : undefined);

      if (data.token) {
        try {
          const decodedUser = jwtDecode(data.token);
          console.log("🟢 Decoded Google JWT:", decodedUser);

          if (!decodedUser.userId || !decodedUser.email) {
            console.error("❌ Google token missing required fields:", decodedUser);
            setError("Invalid Google token received. Please try again.");
            return;
          }

          const userData = { ...data.user, needsPassword: data.needsPassword };

          localStorage.setItem("authToken", data.token);
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("email", userData.email);
          if (data.needsPassword === true) {
            console.log("🟠 Google login indicates password reset is needed.");
            login(data.token, userData); 
            setShowModal(true);
            return;
          }
          login(data.token, userData);
          console.log("🟢 Redirecting to mainpage...");
          navigate("/mainpage");
        } catch (decodeError) {
          console.error("❌ JWT Decode Error:", decodeError);
          setError("Failed to decode Google token.");
        }
      } else {
        console.warn("⚠️ Google login failed:", data);
        setError(data.message || "Google login failed.");
      }
    } catch (err) {
      console.error("🔴 Error in Google login:", err);
      setError("Something went wrong with Google login.");
    }
  };
  const handleSetPassword = async (newPassword) => {
    console.log("🔵 Setting password for user...");
    try {
      const storedEmail = localStorage.getItem("email");
      if (!storedEmail) {
        setError("No email found. Try logging in again.");
        return;
      }
      const payload = {
        email: storedEmail,
        password: newPassword,
        authProvider: "manual"
      };

      console.log("Submitting new password with payload:", payload);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("🔵 Password reset response:", data);

      if (response.ok) {
        alert("Password set successfully. You can now log in manually.");
        setShowModal(false);
        navigate("/mainpage");
      } else {
        console.warn("⚠️ Password reset failed:", data);
        setError(data.message || "Error setting password.");
      }
    } catch (err) {
      console.error("🔴 Error in setting password:", err);
      setError("Something went wrong.");
    }
  };
  const handleSkipPassword = () => {
    console.log("🔵 User skipped setting password.");
    setShowModal(false);
    navigate("/mainpage");
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
          <ResetPasswordModal
            isOpen={showModal}
            userEmail={localStorage.getItem("email") || ""}
            onClose={handleSkipPassword}
            onSubmitPassword={handleSetPassword}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
