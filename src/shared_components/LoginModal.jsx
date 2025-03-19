import React from "react";
import { Modal, Button } from "react-bootstrap";
import "./LoginModal.css";

const LoginModal = ({ show, onYes, onCancel }) => {
  return (
    <Modal 
      show={show} 
      onHide={onCancel} 
      centered 
      style={{ zIndex: 2000 }} 
      animation={true}
    >
      <Modal.Header className="modal-header">
        <button type="button" className="btn-close" aria-label="Close" onClick={onCancel}></button>
        <Modal.Title className="modal-title">
          Please Login to Continue
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="modal-body">
        <p>
          You must log in to view and participate in this auction. Would you like to 
          log in or sign up now?
        </p>
        <div className="modal-options">
          <Button variant="outline-secondary" onClick={onCancel} className="cancel-btn">
            No, I’ll think about it
          </Button>
          <Button variant="primary" onClick={onYes} className="login-btn">
            Yes, Log me in!
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <p className="footer-text">
          <span>Don’t have an account?</span> <a href="/signup">Sign Up</a>
        </p>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;
