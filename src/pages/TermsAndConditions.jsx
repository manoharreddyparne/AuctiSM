import React from "react";
import "./TermsAndConditions.css";

const TermsAndConditions = () => {
  return (
    <div className="terms-content">
      <h1>Terms and Conditions</h1>
      <p>
        By registering for this auction, you agree to the following terms and conditions.
        Please read them carefully before registering.
      </p>
      <ul>
        <li>You must provide accurate and complete registration details.</li>
        <li>Your payment details must be valid and authorized.</li>
        <li>The auction organizer reserves the right to cancel your registration at any time.</li>
        <li>All bids placed during the auction are binding.</li>
        <li>Any disputes will be resolved according to our policies.</li>
      </ul>
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nunc sit amet
        condimentum dictum, nisl massa consectetur nisl, at egestas elit nisl in metus.
      </p>
    </div>
  );
};

export default TermsAndConditions;
