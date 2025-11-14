import React from 'react'
import BookmarkButton from '../BookmarkButton/BookmarkButton'
import LazyImage from '../LazyImage/LazyImage'
import './TopicCard.css'

function TopicCard({ topic, featured = false, onClick }) {
  // Get first section content for featured cards
  const getFirstSectionPreview = () => {
    if (!featured || !topic.content?.sections || topic.content.sections.length === 0) {
      return null
    }
    const firstSection = topic.content.sections[0]
    if (firstSection.content) {
      // Handle content as string or array
      let contentText = ''
      if (Array.isArray(firstSection.content)) {
        contentText = firstSection.content.join(' ')
      } else {
        contentText = firstSection.content
      }
      // Get first 200 characters of first section
      const preview = contentText.substring(0, 200).trim()
      return preview.length < contentText.length ? preview + '...' : preview
    }
    return null
  }

  const firstSectionPreview = getFirstSectionPreview()
  // For featured cards, prioritize abstract, otherwise use description or abstract
  // Remove any trailing ellipses (single or multiple dots) and ensure full text
  const rawText = featured 
    ? (topic.abstract || topic.description || '')
    : (topic.description || topic.abstract || '')
  
  // Remove trailing ellipses and ensure we have the full text
  let description = rawText
    .trim()
    .replace(/\.{2,}\s*$/g, '') // Remove trailing dots (2 or more) with optional space
    .replace(/\.\s*$/, '') // Remove single trailing dot with optional space
    .trim()
  
  // If the text ends with incomplete word or was cut off, try to get more
  // This handles cases where API might have truncated it
  if (featured && description && description.length > 0) {
    // Ensure we're not cutting off mid-sentence if there's more data available
    const fullAbstract = topic.abstract || ''
    const fullDescription = topic.description || ''
    const longestText = fullAbstract.length > fullDescription.length ? fullAbstract : fullDescription
    if (longestText && longestText.length > description.length && !longestText.endsWith('...')) {
      description = longestText.trim().replace(/\.{2,}\s*$/g, '').trim()
    }
  }

  return (
    <div
      className={`topic-card ${featured ? 'topic-card-featured' : ''}`}
      onClick={onClick}
    >
      <div className="topic-image-wrapper" style={{ position: 'relative' }}>
        <LazyImage src={topic.image} alt={topic.title} className="topic-image" />
        <div className="topic-card-bookmark" onClick={(e) => e.stopPropagation()}>
          <BookmarkButton topicId={topic.id} />
        </div>
      </div>
      <div className="topic-content">
        {topic.author && (
          <div className="topic-author">
            <LazyImage src={topic.author.avatar} alt={topic.author.name} className="author-avatar" />
            <span className="author-name">{topic.author.name}</span>
            {topic.author.title && featured && (
              <span className="author-title-small">{topic.author.title}</span>
            )}
            {topic.category && (
              <span className="topic-category-badge">{topic.category}</span>
            )}
          </div>
        )}
        <h3 className="topic-title">{topic.title}</h3>
        {description && (
          <>
            <p className="topic-description">{description}</p>
            {featured && firstSectionPreview && (
              <p className="topic-section-preview">{firstSectionPreview}</p>
            )}
            {(topic.tags && topic.tags.length > 0) || (featured && topic.votes !== undefined) ? (
              <div className="topic-description-divider"></div>
            ) : null}
          </>
        )}
        {featured && (
          <div className="topic-featured-stats">
            {topic.votes !== undefined && (
              <div className="featured-stat-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 11l5-5 5 5M7 21l5-5 5 5"></path>
                </svg>
                <div className="featured-stat-content">
                  <span className="featured-stat-value">{topic.votes}</span>
                  <span className="featured-stat-label">votes</span>
                </div>
              </div>
            )}
            {topic.comments !== undefined && (
              <div className="featured-stat-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <div className="featured-stat-content">
                  <span className="featured-stat-value">{topic.comments || 0}</span>
                  <span className="featured-stat-label">comments</span>
                </div>
              </div>
            )}
            {topic.views !== undefined && (
              <div className="featured-stat-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                <div className="featured-stat-content">
                  <span className="featured-stat-value">{topic.views || 0}</span>
                  <span className="featured-stat-label">views</span>
                </div>
              </div>
            )}
          </div>
        )}
        {topic.tags && topic.tags.length > 0 && (
          <div className="topic-tags">
            {(featured ? topic.tags : topic.tags.slice(0, 3)).map((tag, index) => (
              <span key={index} className="topic-tag">{tag}</span>
            ))}
          </div>
        )}
        <div className="topic-meta">
          {topic.readTime && (
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {topic.readTime} min
            </span>
          )}
          {topic.createdAt && (
            <span className="meta-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              {new Date(topic.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {topic.comments !== undefined && (
            <span className="meta-item" title="Comments">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              {topic.comments || 0}
            </span>
          )}
          {topic.views !== undefined && (
            <span className="meta-item" title="Views">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              {topic.views || 0}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopicCard

