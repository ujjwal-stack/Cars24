import React from 'react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Cars24</h3>
            <p>Your trusted platform for buying and selling used cars</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Services</h4>
            <ul>
              <li><Link to="/buy">Buy Cars</Link></li>
              <li><Link to="/sell">Sell Cars</Link></li>
              <li><Link to="/valuation">Car Valuation</Link></li>
              <li><Link to="/inspection">Inspection</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Contact Info</h4>
            <ul>
              <li>
                <span className="icon">📧</span>
                <a href="mailto:support@cars24.com">support@cars24.com</a>
              </li>
              <li>
                <span className="icon">📞</span>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <span className="icon">📍</span>
                123 Car Street, Auto City
              </li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Cars24. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;