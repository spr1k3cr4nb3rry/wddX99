import React from 'react'
import './AboutHero.css'

function AboutHero() {
  return (
    <section className="about-hero">
      <div className="about-hero-container">
        <div className="about-hero-content">
          <h1 className="about-hero-title">About Our Platform</h1>
          <p className="about-hero-subtitle">
            Empowering collaboration and innovation in education at BYU-Idaho
          </p>
          <p className="about-hero-description">
            We are a collaborative space designed to foster inquiry, share research ideas, 
            discuss emerging trends, and drive meaningful progress in education. Our platform 
            reflects BYU-Idaho's commitment to being a light on a hill—illuminating pathways 
            for educational excellence and innovation.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AboutHero

