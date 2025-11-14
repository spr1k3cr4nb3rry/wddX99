import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Hero.css'

function Hero() {
  useEffect(() => {
    // Preload the image when component mounts to ensure it's cached
    const img = new Image()
    img.src = '/images/pexels-repuding-12064.jpg'
  }, [])

  return (
    <section className="hero">
      <div className="hero-image-container">
        <img 
          src="/images/pexels-repuding-12064.jpg" 
          alt="BYU-Idaho Library" 
          className="hero-image"
          loading="eager"
          fetchPriority="high"
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="hero-line">Explore ideas, vote,</span>
              <span className="hero-line">and impact education</span>
              <span className="hero-line">at BYU-Idaho.</span>
            </h1>
            <div className="hero-actions">
              <Link to="/topics" className="hero-button primary">
                Explore Topics
              </Link>
              <Link to="/about" className="hero-button secondary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

