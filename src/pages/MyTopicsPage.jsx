import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { topicsAPI, usersAPI } from '../services/api'
import './MyTopicsPage.css'

function MyTopicsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [allTopics, setAllTopics] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'drafts', 'pending', 'published'
  const [error, setError] = useState('')

  // Check if user is logged in
  if (!user) {
    return (
      <div className="my-topics-page">
        <Header />
        <main className="my-topics-main">
          <div className="my-topics-container">
            <div className="access-denied">
              <h2>Login Required</h2>
              <p>Please login to view your topics.</p>
              <button onClick={() => navigate('/topics')} className="btn-back">
                Back to Topics
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  useEffect(() => {
    loadMyTopics()
  }, [filter, user])

  const loadMyTopics = async () => {
    setLoading(true)
    setError('')
    try {
      // Get user's topics - user.id or user.userId
      const userId = user?.id || user?.userId
      if (!userId) {
        setError('User ID not found')
        setLoading(false)
        return
      }

      const userTopics = await usersAPI.getTopics(userId)
      setAllTopics(userTopics)
      
      // Filter based on selected filter
      let filtered = userTopics
      if (filter === 'drafts') {
        filtered = userTopics.filter(t => t.status === 'draft')
      } else if (filter === 'pending') {
        filtered = userTopics.filter(t => t.status === 'pending' || (!t.approved && t.status !== 'draft' && t.status !== 'rejected'))
      } else if (filter === 'published') {
        filtered = userTopics.filter(t => t.approved === true || t.status === 'published')
      }
      // 'all' shows everything
      
      setTopics(filtered)
    } catch (err) {
      setError(err.message || 'Failed to load your topics')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (topicId) => {
    navigate(`/topics/edit/${topicId}`)
  }

  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) return

    try {
      await topicsAPI.delete(topicId)
      setError('')
      loadMyTopics() // Reload topics
    } catch (err) {
      setError(err.message || 'Failed to delete topic')
    }
  }

  const handleView = (topicId) => {
    navigate(`/topic/${topicId}`)
  }

  const handleCreate = () => {
    navigate('/topics/create')
  }

  const getStatusBadge = (topic) => {
    if (topic.approved) {
      return <span className="status-badge status-approved">Published</span>
    } else if (topic.status === 'pending') {
      return <span className="status-badge status-pending">Pending Review</span>
    } else if (topic.status === 'rejected') {
      return <span className="status-badge status-rejected">Rejected</span>
    } else if (topic.status === 'draft') {
      return <span className="status-badge status-draft">Draft</span>
    } else {
      return <span className="status-badge status-pending">Pending</span>
    }
  }

  // Calculate counts from allTopics
  const draftsCount = allTopics.filter(t => t.status === 'draft').length
  const pendingCount = allTopics.filter(t => t.status === 'pending' || (!t.approved && t.status !== 'draft' && t.status !== 'rejected')).length
  const publishedCount = allTopics.filter(t => t.approved === true || t.status === 'published').length

  return (
    <div className="my-topics-page">
      <Header />
      <main className="my-topics-main">
        <div className="my-topics-container">
          <div className="my-topics-header">
            <div className="header-top">
              <h1>My Topics</h1>
              <button onClick={handleCreate} className="btn-create-topic">
                + Create New Topic
              </button>
            </div>
            <p className="my-topics-subtitle">
              Manage your topics, drafts, and published content.
            </p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({allTopics.length})
            </button>
            <button
              className={`filter-tab ${filter === 'drafts' ? 'active' : ''}`}
              onClick={() => setFilter('drafts')}
            >
              Drafts ({draftsCount})
            </button>
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({pendingCount})
            </button>
            <button
              className={`filter-tab ${filter === 'published' ? 'active' : ''}`}
              onClick={() => setFilter('published')}
            >
              Published ({publishedCount})
            </button>
          </div>

          {/* Topics List */}
          {loading ? (
            <div className="loading-message">Loading your topics...</div>
          ) : topics.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3>No topics found</h3>
              <p>You haven't created any topics yet. Start by creating your first topic!</p>
              <button onClick={handleCreate} className="btn-primary">
                Create Your First Topic
              </button>
            </div>
          ) : (
            <div className="topics-list">
              {topics.map(topic => (
                <div key={topic.id} className="topic-card">
                  <div className="topic-card-header">
                    <div className="topic-title-section">
                      <h3 className="topic-title">{topic.title}</h3>
                      {getStatusBadge(topic)}
                    </div>
                    <div className="topic-meta-info">
                      <span className="meta-item">
                        {new Date(topic.created_at).toLocaleDateString()}
                      </span>
                      {topic.updated_at && topic.updated_at !== topic.created_at && (
                        <span className="meta-item">
                          Updated: {new Date(topic.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {topic.description && (
                    <p className="topic-description">{topic.description}</p>
                  )}

                  <div className="topic-card-footer">
                    <div className="topic-tags">
                      {topic.tags && Array.isArray(topic.tags) && topic.tags.length > 0 && (
                        topic.tags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="tag">{tag}</span>
                        ))
                      )}
                    </div>
                    <div className="topic-actions">
                      <button
                        onClick={() => handleView(topic.id)}
                        className="btn-action btn-view"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(topic.id)}
                        className="btn-action btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(topic.id)}
                        className="btn-action btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default MyTopicsPage

