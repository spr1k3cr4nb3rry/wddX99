import React from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-column">
            <h3 className="footer-title">Platform</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/topics">All Topics</Link></li>
              <li><Link to="/about">About</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Resources</h3>
            <ul className="footer-links">
              <li><Link to="/resources" onClick={() => window.scrollTo(0, 0)}>Submission Guidelines</Link></li>
              <li><Link to="/resources" onClick={() => window.scrollTo(0, 0)}>Research Resources</Link></li>
              <li><Link to="/resources" onClick={() => window.scrollTo(0, 0)}>Community Standards</Link></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">Contact</h3>
            <ul className="footer-links">
              <li><a href="mailto:support@byui.edu">support@byui.edu</a></li>
              <li><a href="tel:+12084965000">(208) 496-5000</a></li>
              <li>Rexburg, Idaho</li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3 className="footer-title">BYU-Idaho</h3>
            <p className="footer-description">
              Fostering innovation and collaboration in education through research and scholarly discourse.
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} Brigham Young University-Idaho. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

