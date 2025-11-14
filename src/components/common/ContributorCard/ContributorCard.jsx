import React from 'react'
import Button from '../Button/Button'
import './ContributorCard.css'

function ContributorCard({ contributor, onClick }) {
  return (
    <div className="contributor-card" onClick={onClick}>
      <div className="contributor-image-wrapper">
        <img
          src={contributor.image}
          alt={contributor.name}
          className="contributor-image"
        />
      </div>
      <div className="contributor-content">
        <h3 className="contributor-name">{contributor.name}</h3>
        <p className="contributor-title">{contributor.title}</p>
        <p className="contributor-description">{contributor.description}</p>
        <Button 
          variant="primary" 
          className="contributor-topics-btn"
          onClick={(e) => {
            e.stopPropagation()
            if (onClick) onClick()
          }}
        >
          {contributor.topicsCount} Research Topics
        </Button>
      </div>
    </div>
  )
}

export default ContributorCard

