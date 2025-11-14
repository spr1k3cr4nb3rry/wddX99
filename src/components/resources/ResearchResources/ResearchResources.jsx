import React from 'react'
import './ResearchResources.css'

function ResearchResources() {
  const resources = [
    {
      title: 'Research Resources',
      description: 'Access comprehensive academic resources and scholarly materials through the BYU-Idaho Library. Library staff can facilitate your research by helping you locate relevant materials and develop effective search strategies. Use your BYU-Idaho credentials to access these resources.'
    },
    {
      title: 'Citation Management',
      description: 'Utilize citation management tools to organize your sources and generate properly formatted citations. These tools support APA, MLA, Chicago, and other major citation styles. The library offers workshops and consultations to help you get started.'
    },
    {
      title: 'Research Methodology Guides',
      description: 'Comprehensive guides on quantitative, qualitative, and mixed-methods approaches. The library provides access to methodology textbooks, online guides, and research design templates. Faculty advisors can help you select appropriate methodological approaches for your research questions.'
    },
    {
      title: 'Statistical Analysis Resources',
      description: 'Resources to help you analyze your research data, including guides and software tutorials. Workshops on statistical analysis are offered each semester, and faculty members are available for consultation on analytical questions.'
    },
    {
      title: 'Writing Support Services',
      description: 'The Writing Center offers free consultations, comprehensive style guides (APA, MLA, Chicago), and editorial support. Services include help with organization, style, grammar, and citation formatting. Regular workshops cover research writing, proposals, and thesis development.'
    },
    {
      title: 'Research Ethics & IRB',
      description: 'Information on Institutional Review Board (IRB) procedures and research ethics guidelines. All research involving human subjects must receive IRB approval before data collection begins. BYU-Idaho provides training sessions, application assistance, and support throughout the research process.'
    }
  ]

  return (
    <section id="research" className="research-resources-section">
      <div className="resources-container">
        <div className="section-header">
          <h2 className="section-title">Research Resources</h2>
          <p className="section-subtitle">
            Access tools, resources, and support services to enhance your research capabilities
          </p>
        </div>
        <div className="resources-grid">
          {resources.map((resource, index) => (
            <div key={index} className="resource-card">
              <div className="resource-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <h3 className="resource-title">{resource.title}</h3>
              <p className="resource-description">{resource.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ResearchResources

