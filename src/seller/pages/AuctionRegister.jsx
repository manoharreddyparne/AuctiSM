// ✅ AuctionRegister.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TermsAndConditions from "../../pages/TermsAndConditions";
import LoadingOverlay from "../../shared_components/LoadingOverlay";
import "./AuctionRegister.css";

const AuctionRegister = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "enabled");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobileNumber: "",
    paymentDetails: "",
    additionalInfo: "",
    acceptedTerms: false,
  });

  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentDarkMode = localStorage.getItem("darkMode") === "enabled";
      if (currentDarkMode !== darkMode) {
        setDarkMode(currentDarkMode);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [darkMode]);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/registration-status`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.isRegistered) {
          navigate(`/auction-detail/${auctionId}`);
        }
      } catch (error) {}
    };
    checkRegistrationStatus();
  }, [auctionId, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage("");
    if (!formData.acceptedTerms) {
      setError("You must accept the Terms and Conditions to register.");
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Unauthorized: Please log in to register.");
        return;
      }
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auctions/${auctionId}/register`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message || "Successfully registered for the auction!");
      setTimeout(() => navigate(`/auction-detail/${auctionId}`), 3000);
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const openTermsModal = () => setShowTermsModal(true);
  const closeTermsModal = useCallback(() => setShowTermsModal(false), []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") closeTermsModal();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closeTermsModal]);

  const handleCancel = () => navigate(`/auction-detail/${auctionId}`);

  return (
    <div className={`auction-register-container ${darkMode ? "dark-mode" : ""}`}>
      <h2>Auction Registration</h2>
      {message ? (
        <div className="registration-success">
          <div className="checkmark-circle">✔</div>
          <p>{message}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
          />

          <label htmlFor="email">Email Address:</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label htmlFor="mobileNumber">Mobile Number:</label>
          <input
            type="tel"
            id="mobileNumber"
            name="mobileNumber"
            placeholder="Enter your mobile number"
            value={formData.mobileNumber}
            onChange={handleChange}
            required
          />

          <label htmlFor="paymentDetails">Payment Details (e.g., UPI ID):</label>
          <input
            type="text"
            id="paymentDetails"
            name="paymentDetails"
            placeholder="Enter your UPI ID or payment method"
            value={formData.paymentDetails}
            onChange={handleChange}
            required
          />

          <label htmlFor="additionalInfo">Additional Info:</label>
          <textarea
            id="additionalInfo"
            name="additionalInfo"
            placeholder="Any additional information (optional)"
            value={formData.additionalInfo}
            onChange={handleChange}
          ></textarea>

          <div className="terms-container">
            <label className="checkbox-label" htmlFor="acceptedTerms">
              <input
                type="checkbox"
                id="acceptedTerms"
                name="acceptedTerms"
                checked={formData.acceptedTerms}
                onChange={handleChange}
              />
              <span>
                I accept the <span className="terms-link" onClick={openTermsModal}>Terms and Conditions</span>
              </span>
            </label>
          </div>

          <div className="button-group">
            <button type="submit" disabled={!formData.acceptedTerms || loading}>
              {loading ? <LoadingOverlay /> : "Register"}
            </button>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && <p className="error-message">❌ {error}</p>}

      {showTermsModal && (
        <div className="modal-overlay fade-in" onClick={closeTermsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeTermsModal}>
              &times;
            </button>
            <TermsAndConditions />
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionRegister;
