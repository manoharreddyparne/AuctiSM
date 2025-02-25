import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";

const SetPasswordModal = ({ isOpen, onClose, userEmail }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/set-password", {
        email: userEmail,
        password,
      });

      console.log("Password set successfully:", response.data);
      onClose();
    } catch (error) {
      console.error("Error setting password:", error);
      setError("Failed to set password. Try again.");
    }
  };

  return (
    <Modal
      show={isOpen}
      onHide={onClose}
      centered
      backdrop="static" // Prevent modal from closing on outside click
      style={{ pointerEvents: "none" }} // Allows interaction with the background
    >
      <Modal.Dialog style={{ pointerEvents: "auto" }}> {/* Re-enables interaction inside modal */}
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

            {error && <p className="text-danger">{error}</p>}

            <Button variant="primary" type="submit" className="mt-3">
              Set Password
            </Button>
          </Form>
        </Modal.Body>
      </Modal.Dialog>
    </Modal>
  );
};

export default SetPasswordModal;
