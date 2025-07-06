import React from "react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-content">
      <h1>📜 Terms and Conditions – Auctim Auction Platform</h1>

      <p>
        Welcome to Auctim, the decentralized auction bidding platform. By registering for any auction hosted on Auctim, you agree to the terms laid out below. Please review them carefully to ensure a transparent and secure bidding experience.
      </p>

      <h3>1. Registration & Eligibility</h3>
      <ul>
        <li>Participants must provide accurate personal and contact details.</li>
        <li>Only one registration per person per auction is allowed.</li>
        <li>Auctim reserves the right to deny access based on suspicious behavior or duplicate accounts.</li>
      </ul>

      <h3>2. Bidding Guidelines</h3>
      <ul>
        <li>All bids are final and binding once placed.</li>
        <li>Auction time and bid tracking are system-controlled and non-negotiable.</li>
        <li>Any form of automated or malicious bidding will result in account suspension.</li>
      </ul>

      <h3>3. Payment & Verification</h3>
      <ul>
        <li>Winners are expected to complete payment within 24 hours of auction end.</li>
        <li>Supported payment methods include UPI, credit/debit card, or verified wallet payments.</li>
        <li>Unpaid winnings may result in penalties or blacklisting from future auctions.</li>
      </ul>

      <h3>4. Cancellation & Refunds</h3>
      <ul>
        <li>Once registration is completed, cancellation is not allowed unless due to technical error.</li>
        <li>No refunds will be issued after bidding starts.</li>
      </ul>

      <h3>5. System Integrity</h3>
      <ul>
        <li>Auctim ensures a secure platform with regular audits and monitoring.</li>
        <li>We are not responsible for external network failures or device/browser incompatibility.</li>
      </ul>

      <h3>6. Data Privacy</h3>
      <ul>
        <li>All user data is stored securely and not shared with third parties except for legal obligations.</li>
        <li>Contact details are used only for verification and transaction notifications.</li>
      </ul>

      <h3>7. Dispute Resolution</h3>
      <ul>
        <li>All disputes must be submitted via our support portal within 48 hours of occurrence.</li>
        <li>Decisions by the Auctim support team are final and binding.</li>
      </ul>

      <p>
        By continuing with the registration and clicking “Register”, you acknowledge that you have read, understood, and agreed to be bound by these Terms and Conditions.
      </p>

      <p>Thank you for using Auctim. Good luck with your bidding!</p>
    </div>
  );
};

export default TermsAndConditions;
