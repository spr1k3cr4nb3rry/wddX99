import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { whitepapersAPI } from '../services/api'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import './WhitepaperDetailPage.css'

const WhitepaperDetailPage = () => {
  const { id } = useParams()
  const [whitepaper, setWhitepaper] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWhitepaper()
  }, [id])

  const loadWhitepaper = async () => {
    try {
      setLoading(true)
      const data = await whitepapersAPI.getById(id)
      setWhitepaper(data)
    } catch (error) {
      console.error('Failed to load whitepaper:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="whitepaper-detail-page">
        <Header />
        <main className="whitepaper-detail-main">
          <div className="loading">Loading whitepaper...</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!whitepaper) {
    return (
      <div className="whitepaper-detail-page">
        <Header />
        <main className="whitepaper-detail-main">
          <div>Whitepaper not found</div>
        </main>
        <Footer />
      </div>
    )
  }

  const citations = Array.isArray(whitepaper.citations) ? whitepaper.citations : []
  const resources = Array.isArray(whitepaper.resources) ? whitepaper.resources : []

  return (
    <div className="whitepaper-detail-page">
      <Header />
      <main className="whitepaper-detail-main">
        <div className="whitepaper-content-wrapper">
          <div className="whitepaper-header">
        <h1>{whitepaper.title}</h1>
        {whitepaper.author && (
          <div className="author">By {whitepaper.author}</div>
        )}
        {whitepaper.category && (
          <span className="category-badge">{whitepaper.category}</span>
        )}
      </div>

      {whitepaper.abstract && (
        <div className="abstract-section">
          <h2>Abstract</h2>
          <p>{whitepaper.abstract}</p>
        </div>
      )}

      <div className="content-section">
        <h2>Content</h2>
        <div className="whitepaper-content">
          {typeof whitepaper.content === 'string' ? (
            <div dangerouslySetInnerHTML={{ __html: whitepaper.content }} />
          ) : (
            <p>{whitepaper.content}</p>
          )}
        </div>
      </div>

      {citations.length > 0 && (
        <div className="citations-section">
          <h2>Citations</h2>
          <ul className="citations-list">
            {citations.map((citation, index) => (
              <li key={index} className="citation-item">
                {typeof citation === 'string' ? citation : citation.text || JSON.stringify(citation)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {resources.length > 0 && (
        <div className="resources-section">
          <h2>Resources</h2>
          <ul className="resources-list">
            {resources.map((resource, index) => (
              <li key={index} className="resource-item">
                {typeof resource === 'string' ? (
                  <a href={resource} target="_blank" rel="noopener noreferrer">{resource}</a>
                ) : (
                  <a href={resource.url || resource.link} target="_blank" rel="noopener noreferrer">
                    {resource.title || resource.name || resource.url || resource.link}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {whitepaper.tags && Array.isArray(whitepaper.tags) && whitepaper.tags.length > 0 && (
        <div className="tags-section">
          <h3>Tags</h3>
          <div className="tags-list">
            {whitepaper.tags.map((tag, index) => (
              <span key={index} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default WhitepaperDetailPage

