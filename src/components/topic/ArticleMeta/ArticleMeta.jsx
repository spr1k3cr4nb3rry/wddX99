import React from 'react'
import './ArticleMeta.css'

function ArticleMeta({ topic }) {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="article-meta">
      <h3 className="article-meta-title">Article Details</h3>
      <dl className="article-meta-list">
        <div className="meta-item">
          <dt className="meta-label">Published</dt>
          <dd className="meta-value">{formatDate(topic.createdAt)}</dd>
        </div>
        {topic.lastUpdated && (
          <div className="meta-item">
            <dt className="meta-label">Last Updated</dt>
            <dd className="meta-value">{formatDate(topic.lastUpdated)}</dd>
          </div>
        )}
        <div className="meta-item">
          <dt className="meta-label">Category</dt>
          <dd className="meta-value">{topic.category || 'Uncategorized'}</dd>
        </div>
        <div className="meta-item">
          <dt className="meta-label">Read Time</dt>
          <dd className="meta-value">{topic.readTime || 5} min</dd>
        </div>
        {topic.metadata?.methodology && (
          <div className="meta-item">
            <dt className="meta-label">Methodology</dt>
            <dd className="meta-value">{topic.metadata.methodology}</dd>
          </div>
        )}
        {topic.metadata?.sampleSize && (
          <div className="meta-item">
            <dt className="meta-label">Sample Size</dt>
            <dd className="meta-value">{topic.metadata.sampleSize}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export default ArticleMeta

