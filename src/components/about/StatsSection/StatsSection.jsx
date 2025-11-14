import React from 'react'
import './StatsSection.css'

function StatsSection() {
  const stats = [
    {
      number: '12',
      label: 'Research Topics',
      description: 'Active scholarly discussions'
    },
    {
      number: '50',
      label: 'Faculty Contributors',
      description: 'Active researchers and educators'
    },
    {
      number: '200',
      label: 'Peer Evaluations',
      description: 'Scholarly feedback and assessment'
    },
    {
      number: '100',
      label: 'Research Contributions',
      description: 'Academic insights and analysis'
    }
  ]

  return (
    <section className="stats-section">
      <div className="stats-container">
        <div className="stats-content">
          <h2 className="stats-title">Platform Impact</h2>
          <p className="stats-subtitle">
            Our growing community is making a difference in education
          </p>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <h3 className="stat-label">{stat.label}</h3>
                <p className="stat-description">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default StatsSection

