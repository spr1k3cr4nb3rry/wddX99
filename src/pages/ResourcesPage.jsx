import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ResourcesHero from '../components/resources/ResourcesHero/ResourcesHero'
import SubmissionGuidelines from '../components/resources/SubmissionGuidelines/SubmissionGuidelines'
import ResearchResources from '../components/resources/ResearchResources/ResearchResources'
import CommunityStandards from '../components/resources/CommunityStandards/CommunityStandards'
import './ResourcesPage.css'

function ResourcesPage() {
  const location = useLocation()

  useEffect(() => {
    // Scroll to top when component mounts or location changes
    window.scrollTo(0, 0)
  }, [location])

  return (
    <div className="resources-page">
      <Header />
      <main className="resources-main">
        <ResourcesHero />
        <SubmissionGuidelines />
        <ResearchResources />
        <CommunityStandards />
      </main>
      <Footer />
    </div>
  )
}

export default ResourcesPage

