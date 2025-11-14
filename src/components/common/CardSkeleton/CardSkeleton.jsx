import React from 'react'
import './CardSkeleton.css'

function CardSkeleton({ count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-header">
              <div className="skeleton-avatar"></div>
              <div className="skeleton-text-small"></div>
            </div>
            <div className="skeleton-title"></div>
            <div className="skeleton-description"></div>
            <div className="skeleton-description short"></div>
            <div className="skeleton-tags">
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
              <div className="skeleton-tag"></div>
            </div>
            <div className="skeleton-meta">
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
              <div className="skeleton-meta-item"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  )
}

export default CardSkeleton

