import React from 'react'
import './MissionSection.css'

function MissionSection() {
  return (
    <section className="mission-section">
      <div className="mission-container">
        <div className="mission-content">
          <div className="mission-text">
            <h2 className="mission-section-title">Our Mission</h2>
            <p className="mission-description">
              Our mission is to establish a scholarly platform that facilitates meaningful collaboration 
              among faculty, researchers, and students. Through rigorous academic discourse and shared 
              inquiry, we advance educational research and practice. We are committed to fostering an 
              environment where evidence-based research informs pedagogical innovation and institutional 
              improvement.
            </p>
            <div className="mission-points">
              <div className="mission-point">
                <div className="mission-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                    <path d="M2 17l10 5 10-5"></path>
                    <path d="M2 12l10 5 10-5"></path>
                  </svg>
                </div>
                <h3>Academic Collaboration</h3>
                <p>Facilitate connections between faculty and researchers to advance scholarly inquiry and knowledge sharing</p>
              </div>
              <div className="mission-point">
                <div className="mission-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <h3>Research Advancement</h3>
                <p>Support evidence-based research methodologies and promote scholarly contributions to the field</p>
              </div>
              <div className="mission-point">
                <div className="mission-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Scholarly Community</h3>
                <p>Foster an inclusive academic environment that respects diverse perspectives and methodological approaches</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MissionSection

