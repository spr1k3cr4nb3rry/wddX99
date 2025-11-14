import React from 'react'
import './ValuesSection.css'

function ValuesSection() {
  const values = [
    {
      title: 'Academic Rigor',
      description: 'We maintain high standards for scholarly inquiry and evidence-based research practices.'
    },
    {
      title: 'Intellectual Collaboration',
      description: 'We recognize that meaningful research emerges through sustained scholarly discourse and interdisciplinary engagement.'
    },
    {
      title: 'Institutional Excellence',
      description: 'We uphold the highest standards of academic integrity and pedagogical effectiveness.'
    },
    {
      title: 'Ethical Conduct',
      description: 'We adhere to principles of academic honesty, transparency, and ethical scholarship.'
    },
    {
      title: 'Inclusive Scholarship',
      description: 'We value diverse methodological approaches and perspectives that enrich academic discourse.'
    },
    {
      title: 'Service to Education',
      description: 'We are dedicated to advancing educational outcomes through research, teaching, and institutional improvement.'
    }
  ]

  return (
    <section className="values-section">
      <div className="values-container">
        <div className="values-header">
          <h2 className="values-section-title">Our Values</h2>
          <p className="values-subtitle">
            The principles that guide our platform and community
          </p>
        </div>
        <div className="values-grid">
          {values.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-number">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-description">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValuesSection

