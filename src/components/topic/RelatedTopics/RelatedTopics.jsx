import React from 'react'
import { useNavigate } from 'react-router-dom'
import './RelatedTopics.css'

function RelatedTopics({ topics = [] }) {
  const navigate = useNavigate()

  if (!topics || topics.length === 0) return null

  const handleTopicClick = (topicId) => {
    navigate(`/topic/${topicId}`)
    window.scrollTo(0, 0)
  }

  return (
    <div className="related-topics">
      <h3 className="related-topics-title">Related Topics</h3>
      <ul className="related-topics-list">
        {topics.map((topic) => (
          <li key={topic.id} className="related-topic-item">
            <button
              className="related-topic-link"
              onClick={() => handleTopicClick(topic.id)}
            >
              <span className="related-topic-title">{topic.title}</span>
              {topic.category && (
                <span className="related-topic-category">{topic.category}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default RelatedTopics

