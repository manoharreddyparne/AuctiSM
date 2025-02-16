import React from "react";
import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import "./Contact.css"; // Ensure styles are linked

const Contact = () => {
  return (
    <div className="contact-section">
      {/* Student Section */}
      <div className="contact-column">
        <h3>Student Section</h3>
        <ul>
          <li>Student Registration</li>
          <li>Student Login</li>
          <li>Student Blogs</li>
          <li>Success Stories</li>
          <li>Student Module Demo</li>
          <li>Ethics Courses</li>
        </ul>
      </div>

      {/* Company Section */}
      <div className="contact-column">
        <h3>Company Section</h3>
        <ul>
          <li>Company Registration</li>
          <li>Company Login</li>
          <li>Success Stories</li>
          <li>Company Module Demo</li>
        </ul>
      </div>

      {/* Useful Resources */}
      <div className="contact-column">
        <h3>Useful Resources</h3>
        <ul>
          <li>Ministry of Education</li>
          <li>All India Council for Technical Education</li>
          <li>National Educational Alliance for Technology (NEAT)</li>
          <li>National Career Service (NCS)</li>
        </ul>
      </div>

      {/* About & Contact */}
      <div className="contact-column">
        <h3>About Us</h3>
        <ul>
          <li>About AuctiSM</li>
          <li>Our Team</li>
          <li>Internship Blogs</li>
          <li>Download AuctiSM Mobile App</li>
        </ul>
        <h3>Have Questions?</h3>
        <p>
          AuctiSM Team<br />
          Your Address Here<br />
          011-12345678<br />
          support@auctism.com
        </p>
      </div>

      {/* Social Media Icons */}
      <div className="contact-icons">
        <a href="www.facebook.com"><FaFacebook /></a>
        <a href="x.com"><FaTwitter /></a>
        <a href="www.instagram.com"><FaInstagram /></a>
      </div>
    </div>
  );
};

export default Contact;
