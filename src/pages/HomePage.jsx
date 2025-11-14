import React from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/home/Hero/Hero'
import IntroText from '../components/home/IntroText'
import TrendingTopics from '../components/home/TrendingTopics/TrendingTopics'
import TopContributors from '../components/home/TopContributors/TopContributors'
import './HomePage.css'

function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main>
        <Hero />
        <IntroText />
        <TrendingTopics />
        <TopContributors />
      </main>
      <Footer />
    </div>
  )
}

export default HomePage

