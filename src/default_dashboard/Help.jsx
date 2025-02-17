import React from 'react'
import './Help.css';  // Assuming you want to add a separate CSS file for styling

const Help = () => {
  return (
    <div className="help-container">
      <h1 className="help-title">Help</h1>
      <p className="help-description">
        Welcome to the help section. Here you'll find information to assist you with your experience.
      </p>
      <section className="help-section">
        <h2>Need Assistance?</h2>
        <p>If you're facing any issues, feel free to reach out to us!</p>
        <ul>
          <li>Email: support@auctism.com</li>
          <li>Phone: +1-800-123-4567</li>
          <li>Live Chat: Available on the bottom right corner of the page</li>
        </ul>
      </section>
      <section className="help-section">
        <h2>Helpful Resources</h2>
        <ul>
          <li>Getting Started Guide</li>
          <li>How to Place a Bid</li>
          <li>Understanding Auction Timelines</li>
        </ul>
      </section>
    </div>
  )
}

export default Help;
