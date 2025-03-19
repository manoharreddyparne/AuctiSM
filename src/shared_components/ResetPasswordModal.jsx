import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "./ResetPasswordModal.css";

const ResetPasswordModal = ({ isOpen, onClose, userEmail, onSubmitPassword }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }, [isOpen, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("❌ Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await onSubmitPassword(password);
      setSuccess("✅ Password set successfully! Redirecting...");
      setTimeout(() => {
        onClose();
        navigate("/mainpage");
      }, 2000);
    } catch (err) {
      setError("Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onClose();
    navigate("/mainpage");
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
      <Modal.Dialog>
        <Modal.Header closeButton>
          <Modal.Title>Set Your Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger" aria-live="assertive">{error}</Alert>}
          {success && <Alert variant="success" aria-live="polite">{success}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
            </Form.Group>
            <div className="d-flex justify-content-between mt-3">
              <Button
                variant="secondary"
                onClick={handleSkip}
                disabled={isLoading}
                className="skip-btn"
              >
                Skip
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading}
                className="set-password-btn"
              >
                {isLoading ? <Spinner animation="border" size="sm" /> : "Set Password"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal.Dialog>
    </Modal>
  );
};

export default ResetPasswordModal;
