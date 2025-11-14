import React from 'react'
import './TopicListItem.css'

function TopicListItem({ topic, onClick }) {
  return (
    <div className="topic-list-item" onClick={onClick}>
      <div className="topic-list-image">
        <img src={topic.image} alt={topic.title} />
      </div>
      <div className="topic-list-content">
        <div className="topic-list-header">
          <div className="topic-list-author">
            <img src={topic.author.avatar} alt={topic.author.name} className="author-avatar" />
            <span className="author-name">{topic.author.name}</span>
          </div>
          <span className="topic-category">{topic.category}</span>
        </div>
        <h3 className="topic-list-title">{topic.title}</h3>
        {topic.description && (
          <p className="topic-list-description">{topic.description}</p>
        )}
        <div className="topic-list-tags">
          {topic.tags.map((tag, index) => (
            <span key={index} className="topic-tag">{tag}</span>
          ))}
        </div>
        <div className="topic-list-stats">
          <span className="stat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 15l-6-6-6 6"></path>
            </svg>
            {topic.votes} votes
          </span>
          <span className="stat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {topic.comments} comments
          </span>
          <span className="stat-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            {topic.views} views
          </span>
          <span className="stat-item">
            {new Date(topic.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  )
}

export default TopicListItem

