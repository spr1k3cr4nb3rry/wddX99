import React from 'react'
import './CommunityStandards.css'

function CommunityStandards() {
  const standards = [
    {
      title: 'Respectful Discourse',
      description: 'Maintain professional and respectful communication in all interactions. Engage in constructive dialogue that values diverse perspectives and promotes mutual understanding.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    },
    {
      title: 'Academic Integrity',
      description: 'Uphold the highest standards of academic honesty. Properly attribute sources, avoid plagiarism, and ensure all research contributions are original and properly cited.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9"></path>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
        </svg>
      )
    },
    {
      title: 'Collaborative Spirit',
      description: 'Foster a collaborative environment where ideas can be shared, discussed, and refined. Support fellow researchers and contribute to the collective knowledge of the community.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      )
    },
    {
      title: 'Inclusive Participation',
      description: 'Welcome diverse voices and perspectives. Ensure all community members feel valued and respected regardless of background, experience level, or academic discipline.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="2" x2="12" y2="6"></line>
          <line x1="12" y1="18" x2="12" y2="22"></line>
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
          <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
          <line x1="2" y1="12" x2="6" y2="12"></line>
          <line x1="18" y1="12" x2="22" y2="12"></line>
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
          <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
      )
    },
    {
      title: 'Ethical Research Practices',
      description: 'Conduct research in accordance with ethical guidelines and institutional policies. Respect participant rights, maintain confidentiality, and ensure research integrity at all times.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      )
    },
    {
      title: 'Quality Contributions',
      description: 'Strive for excellence in all submissions. Provide well-researched, thoughtful contributions that add value to scholarly discourse and advance educational understanding.',
      icon: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      )
    }
  ]

  return (
    <section id="community" className="community-standards-section">
      <div className="standards-container">
        <div className="section-header">
          <h2 className="section-title">Community Standards</h2>
          <p className="section-subtitle">
            Our shared values and expectations that guide respectful collaboration and scholarly excellence
          </p>
        </div>
        <div className="standards-grid">
          {standards.map((standard, index) => (
            <div key={index} className="standard-card">
              <div className="standard-icon">
                {standard.icon}
              </div>
              <h3 className="standard-title">{standard.title}</h3>
              <p className="standard-description">{standard.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CommunityStandards

