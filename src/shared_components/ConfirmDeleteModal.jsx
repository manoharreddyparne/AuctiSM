import React, { useEffect } from "react";
import "./ConfirmDeleteModal.css"; 

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm }) => {

  useEffect(() => {
    if (!isOpen) return; 

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null; 

  return (
    <div className="modal-overlay">
      <div className="modal-container" role="dialog" aria-modal="true">
        <h2 className="modal-title">Confirm Deletion</h2>
        <p className="modal-message">
          Are you sure you want to delete this auction? This action cannot be undone.
        </p>
        <div className="modal-buttons">
          <button onClick={onClose} className="cancel-button">Cancel</button>
          <button onClick={onConfirm} className="delete-button">Delete</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
