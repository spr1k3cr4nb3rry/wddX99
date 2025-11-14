import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { canApproveTopic } from '../utils/permissions'
import { topicsAPI } from '../services/api'
import './AdminPanel.css'

function AdminPanel() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [allTopics, setAllTopics] = useState([])
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending') // 'pending', 'approved', 'rejected', 'all'
  const [error, setError] = useState('')

  // Check if user is admin
  if (!user || !canApproveTopic(user)) {
    return (
      <div className="admin-panel-page">
        <Header />
        <main className="admin-panel-main">
          <div className="admin-panel-container">
            <div className="access-denied">
              <h2>Access Denied</h2>
              <p>Only administrators can access this panel.</p>
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
    loadTopics()
  }, [filter])

  const loadTopics = async () => {
    setLoading(true)
    setError('')
    try {
      // Get all topics (admins can see all)
      const fetchedTopics = await topicsAPI.getAll()
      setAllTopics(fetchedTopics)
      
      // Filter based on selected filter
      let filtered = fetchedTopics
      if (filter === 'pending') {
        filtered = fetchedTopics.filter(t => !t.approved && (t.status === 'pending' || (!t.status && !t.approved)))
      } else if (filter === 'approved') {
        filtered = fetchedTopics.filter(t => t.approved === true)
      } else if (filter === 'rejected') {
        filtered = fetchedTopics.filter(t => t.approved === false && t.status === 'rejected')
      } else if (filter === 'drafts') {
        filtered = fetchedTopics.filter(t => t.status === 'draft')
      }
      // 'all' shows everything
      
      setTopics(filtered)
    } catch (err) {
      setError(err.message || 'Failed to load topics')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (topicId) => {
    if (!window.confirm('Are you sure you want to approve this topic?')) return

    try {
      await topicsAPI.approve(topicId)
      setError('')
      loadTopics() // Reload topics
    } catch (err) {
      setError(err.message || 'Failed to approve topic')
    }
  }

  const handleReject = async (topicId) => {
    if (!window.confirm('Are you sure you want to reject this topic?')) return

    try {
      await topicsAPI.reject(topicId)
      setError('')
      loadTopics() // Reload topics
    } catch (err) {
      setError(err.message || 'Failed to reject topic')
    }
  }

  const handleDelete = async (topicId) => {
    if (!window.confirm('Are you sure you want to delete this topic? This action cannot be undone.')) return

    try {
      await topicsAPI.delete(topicId)
      setError('')
      loadTopics() // Reload topics
    } catch (err) {
      setError(err.message || 'Failed to delete topic')
    }
  }

  const handleEdit = (topicId) => {
    navigate(`/topics/edit/${topicId}`)
  }

  const handleView = (topicId) => {
    navigate(`/topic/${topicId}`)
  }

  const getStatusBadge = (topic) => {
    if (topic.approved) {
      return <span className="status-badge status-approved">Approved</span>
    } else if (topic.status === 'pending') {
      return <span className="status-badge status-pending">Pending</span>
    } else if (topic.status === 'rejected') {
      return <span className="status-badge status-rejected">Rejected</span>
    } else if (topic.status === 'draft') {
      return <span className="status-badge status-draft">Draft</span>
    } else {
      return <span className="status-badge status-unknown">Unknown</span>
    }
  }

  return (
    <div className="admin-panel-page">
      <Header />
      <main className="admin-panel-main">
        <div className="admin-panel-container">
          <div className="admin-panel-header">
            <h1>Admin Panel</h1>
            <p className="admin-panel-subtitle">Manage topics, approve submissions, and moderate content.</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Filter Tabs */}
          <div className="filter-tabs">
            <button
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              Pending ({allTopics.filter(t => !t.approved && (t.status === 'pending' || (!t.status && !t.approved))).length})
            </button>
            <button
              className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
              onClick={() => setFilter('approved')}
            >
              Approved ({allTopics.filter(t => t.approved === true).length})
            </button>
            <button
              className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
              onClick={() => setFilter('rejected')}
            >
              Rejected ({allTopics.filter(t => t.approved === false && t.status === 'rejected').length})
            </button>
            <button
              className={`filter-tab ${filter === 'drafts' ? 'active' : ''}`}
              onClick={() => setFilter('drafts')}
            >
              Drafts ({allTopics.filter(t => t.status === 'draft').length})
            </button>
            <button
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Topics ({allTopics.length})
            </button>
          </div>

          {/* Topics List */}
          {loading ? (
            <div className="loading-message">Loading topics...</div>
          ) : topics.length === 0 ? (
            <div className="empty-message">
              No topics found for this filter.
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
                      <span className="meta-item">By: {topic.user_name || 'Unknown'}</span>
                      <span className="meta-item">
                        {new Date(topic.created_at).toLocaleDateString()}
                      </span>
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
                      {!topic.approved && topic.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(topic.id)}
                            className="btn-action btn-approve"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(topic.id)}
                            className="btn-action btn-reject"
                          >
                            Reject
                          </button>
                        </>
                      )}
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

export default AdminPanel

