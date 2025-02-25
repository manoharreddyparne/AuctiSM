import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import "./ResetPasswordModal.css";

const ResetPasswordModal = ({ isOpen, onClose, userEmail }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Add debug logging to track component state
  useEffect(() => {
    console.log("ResetPasswordModal isOpen:", isOpen);
    console.log("User email:", userEmail);
  }, [isOpen, userEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/set-password", {
        email: userEmail,
        password,
      });

      console.log("Password set successfully:", response.data);
      onClose(); // Close the modal after successful password set
    } catch (error) {
      console.error("Error setting password:", error);
      setError("Failed to set password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      backdrop="static" // Prevent modal from closing when clicking outside
      style={{ pointerEvents: "none" }} // Prevent interaction with the background
    >
      <Modal.Dialog style={{ pointerEvents: "auto" }}>
        <Modal.Header closeButton>
          <Modal.Title>Set Your Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            {error && <p className="text-danger">{error}</p>} {/* Display error message */}

            <Button variant="primary" type="submit" className="mt-3" disabled={isLoading}>
              {isLoading ? "Setting Password..." : "Set Password"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal.Dialog>
    </Modal>
  );
};

export default ResetPasswordModal;
