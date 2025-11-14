import React from 'react'
import './SubmissionGuidelines.css'

function SubmissionGuidelines() {
  const guidelines = [
    {
      title: 'Topic Structure',
      description: 'Each topic submission should include a clear title, comprehensive description, relevant categories, and appropriate tags to facilitate discovery and discussion.'
    },
    {
      title: 'Content Requirements',
      description: 'Submissions must be original, well-researched, and contribute meaningfully to educational discourse. All content should adhere to academic standards and ethical research practices.'
    },
    {
      title: 'Review Process',
      description: 'All submissions undergo peer review to ensure quality, relevance, and adherence to platform standards. The review process typically takes 3-5 business days.'
    },
    {
      title: 'Formatting Standards',
      description: 'Topics should follow standard academic formatting guidelines. Include proper citations where applicable and ensure clarity in presentation.'
    },
    {
      title: 'Ethical Considerations',
      description: 'All submissions must comply with institutional ethics policies, respect intellectual property rights, and maintain professional standards of conduct.'
    },
    {
      title: 'Revision and Updates',
      description: 'Contributors may update their submissions based on feedback and ongoing research developments. Significant revisions may require re-review.'
    }
  ]

  return (
    <section id="guidelines" className="submission-guidelines-section">
      <div className="guidelines-container">
        <div className="section-header">
          <h2 className="section-title">Submission Guidelines</h2>
          <p className="section-subtitle">
            Follow these guidelines to ensure your research topics and propositions meet our platform standards
          </p>
        </div>
        <div className="guidelines-grid">
          {guidelines.map((guideline, index) => (
            <div key={index} className="guideline-card">
              <div className="guideline-number">{String(index + 1).padStart(2, '0')}</div>
              <h3 className="guideline-title">{guideline.title}</h3>
              <p className="guideline-description">{guideline.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default SubmissionGuidelines

