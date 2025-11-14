import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { usersAPI, uploadAPI } from '../services/api'
import './DashboardPage.css'

function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    title: '',
    avatar: '',
    location: '',
    website: ''
  })

  useEffect(() => {
    if (!user) {
      navigate('/topics')
      return
    }
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await usersAPI.getDashboard()
      setProfile(data)
      setFormData({
        name: data.name || '',
        bio: data.bio || '',
        title: data.title || '',
        avatar: data.avatar || '',
        location: data.location || '',
        website: data.website || ''
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploadingAvatar(true)
    setError('')

    try {
      const result = await uploadAPI.uploadImage(file)
      setFormData({
        ...formData,
        avatar: result.path
      })
    } catch (err) {
      setError(err.message || 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const userId = user?.id || user?.userId
      const updated = await usersAPI.update(userId, formData)
      setProfile(updated)
      setEditing(false)
      // Update auth context if needed
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      bio: profile?.bio || '',
      title: profile?.title || '',
      avatar: profile?.avatar || '',
      location: profile?.location || '',
      website: profile?.website || ''
    })
    setEditing(false)
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !profile) {
    return (
      <div className="dashboard-page">
        <Header />
        <main className="dashboard-main">
          <div className="dashboard-container">
            <div className="error-message">{error}</div>
            <button onClick={loadDashboard} className="btn-retry">Retry</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const stats = profile?.statistics || {}

  return (
    <div className="dashboard-page">
      <Header />
      <main className="dashboard-main">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>My Dashboard</h1>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-edit-profile">
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {editing ? (
            <form onSubmit={handleSave} className="profile-edit-form">
              <div className="profile-edit-section">
                <h2>Profile Information</h2>
                
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="title">Title/Position</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Associate Professor, Department of Education"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g., Rexburg, ID"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Profile Picture</label>
                  <div className="avatar-upload-section">
                    {formData.avatar && (
                      <img src={formData.avatar} alt="Avatar" className="avatar-preview" />
                    )}
                    <label className="btn-upload-avatar">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploadingAvatar}
                        style={{ display: 'none' }}
                      />
                      {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-save" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" onClick={handleCancel} className="btn-cancel" disabled={saving}>
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
              {/* Profile Overview */}
              <div className="dashboard-section">
                <div className="profile-overview">
                  <div className="profile-avatar-section">
                    <img
                      src={profile?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=006EB6&color=fff`}
                      alt={profile?.name}
                      className="profile-avatar-large"
                    />
                    <h2>{profile?.name}</h2>
                    {profile?.title && <p className="profile-title-text">{profile?.title}</p>}
                    {profile?.location && <p className="profile-location">{profile?.location}</p>}
                    {profile?.website && (
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="profile-website">
                        {profile.website}
                      </a>
                    )}
                  </div>
                  {profile?.bio && (
                    <div className="profile-bio-section">
                      <h3>About</h3>
                      <p>{profile.bio}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="dashboard-section">
                <h2 className="section-title">Statistics</h2>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{stats.topicsCount || 0}</div>
                    <div className="stat-label">Topics</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">💬</div>
                    <div className="stat-value">{stats.commentsCount || 0}</div>
                    <div className="stat-label">Comments</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👍</div>
                    <div className="stat-value">{stats.votesReceived || 0}</div>
                    <div className="stat-label">Votes Received</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-value">{stats.viewsReceived || 0}</div>
                    <div className="stat-label">Total Views</div>
                  </div>
                </div>
              </div>

              {/* Topics by Status */}
              {stats.topicsByStatus && Object.keys(stats.topicsByStatus).length > 0 && (
                <div className="dashboard-section">
                  <h2 className="section-title">Topics by Status</h2>
                  <div className="status-breakdown">
                    {Object.entries(stats.topicsByStatus).map(([status, count]) => (
                      <div key={status} className="status-item">
                        <span className="status-name">{status}</span>
                        <span className="status-count">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Topics */}
              {profile?.recentTopics && profile.recentTopics.length > 0 && (
                <div className="dashboard-section">
                  <h2 className="section-title">Recent Topics</h2>
                  <div className="recent-items-list">
                    {profile.recentTopics.map(topic => (
                      <div key={topic.id} className="recent-item">
                        <div className="recent-item-content">
                          <h4 onClick={() => navigate(`/topic/${topic.id}`)} className="recent-item-title">
                            {topic.title}
                          </h4>
                          <div className="recent-item-meta">
                            <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                            <span className={`status-badge status-${topic.status || 'pending'}`}>
                              {topic.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                        <div className="recent-item-stats">
                          <span>👍 {topic.votes || 0}</span>
                          <span>👁️ {topic.views || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => navigate('/my-topics')} className="btn-view-all">
                    View All Topics →
                  </button>
                </div>
              )}

              {/* Recent Comments */}
              {profile?.recentComments && profile.recentComments.length > 0 && (
                <div className="dashboard-section">
                  <h2 className="section-title">Recent Comments</h2>
                  <div className="recent-items-list">
                    {profile.recentComments.map(comment => (
                      <div key={comment.id} className="recent-item">
                        <div className="recent-item-content">
                          <p className="recent-comment-text">{comment.content}</p>
                          <div className="recent-item-meta">
                            <span>{new Date(comment.created_at).toLocaleDateString()}</span>
                            {comment.topic_title && (
                              <span 
                                onClick={() => navigate(`/topic/${comment.topic_id}`)}
                                className="recent-item-link"
                              >
                                on {comment.topic_title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default DashboardPage


