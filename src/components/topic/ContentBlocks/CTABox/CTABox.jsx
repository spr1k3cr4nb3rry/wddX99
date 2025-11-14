import React from 'react'
import './CTABox.css'

function CTABox({ title, description, buttonText, buttonLink, variant = 'primary' }) {
  if (!title && !description) return null

  return (
    <div className={`cta-box cta-box-${variant}`}>
      {title && <h3 className="cta-box-title">{title}</h3>}
      {description && <p className="cta-box-description">{description}</p>}
      {buttonText && buttonLink && (
        <a href={buttonLink} className="cta-box-button" target="_blank" rel="noopener noreferrer">
          {buttonText}
        </a>
      )}
    </div>
  )
}

export default CTABox

