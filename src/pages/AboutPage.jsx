import React from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import AboutHero from '../components/about/AboutHero/AboutHero'
import MissionSection from '../components/about/MissionSection/MissionSection'
import FeaturesSection from '../components/about/FeaturesSection/FeaturesSection'
import ValuesSection from '../components/about/ValuesSection/ValuesSection'
import StatsSection from '../components/about/StatsSection/StatsSection'
import './AboutPage.css'

function AboutPage() {
  return (
    <div className="about-page">
      <Header />
      <main className="about-main">
        <AboutHero />
        <MissionSection />
        <FeaturesSection />
        <ValuesSection />
        <StatsSection />
      </main>
      <Footer />
    </div>
  )
}

export default AboutPage

