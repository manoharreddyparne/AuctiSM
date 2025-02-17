import React from 'react'
import './Guidance.css';  // Assuming you want to add a separate CSS file for styling

const Guidance = () => {
  return (
    <div className="guidance-container">
      <h1 className="guidance-title">Guidance</h1>
      <p className="guidance-description">
        Here you will find helpful instructions and tips on how to use the platform effectively.
      </p>
      <section className="guidance-section">
        <h2>How to Get Started</h2>
        <ul>
          <li>Create an account</li>
          <li>Explore available auctions</li>
          <li>Place bids and track your progress</li>
        </ul>
      </section>
      <section className="guidance-section">
        <h2>Frequently Asked Questions</h2>
        <ul>
          <li>How do I place a bid?</li>
          <li>What happens if I'm outbid?</li>
          <li>How do I check my current bids?</li>
        </ul>
      </section>
    </div>
  )
}

export default Guidance;
