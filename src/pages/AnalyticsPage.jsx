import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { canApproveTopic } from '../utils/permissions'
import { analyticsAPI } from '../services/api'
import './AnalyticsPage.css'

const COLORS = ['#006EB6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

function AnalyticsPage() {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('30d')
  const [viewMode, setViewMode] = useState(userId ? 'user' : 'platform') // 'platform' or 'user'

  const isAdmin = user && canApproveTopic(user)
  const isViewingOwn = !userId || (user && (user.id === parseInt(userId) || user.userId === parseInt(userId)))

  useEffect(() => {
    if (!user) {
      navigate('/topics')
      return
    }

    // Check permissions
    if (viewMode === 'platform' && !isAdmin) {
      navigate('/dashboard')
      return
    }

    if (viewMode === 'user' && userId && !isViewingOwn && !isAdmin) {
      navigate('/dashboard')
      return
    }

    loadAnalytics()
  }, [period, viewMode, userId, user])

  const loadAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      let data
      if (viewMode === 'platform') {
        data = await analyticsAPI.getPlatform(period)
      } else {
        const targetUserId = userId || user?.id || user?.userId
        data = await analyticsAPI.getUser(targetUserId, period)
      }
      setAnalytics(data)
    } catch (err) {
      setError(err.message || 'Failed to load analytics')
      console.error('Error loading analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="analytics-page">
        <Header />
        <main className="analytics-main">
          <div className="analytics-container">
            <p>Loading analytics...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !analytics) {
    return (
      <div className="analytics-page">
        <Header />
        <main className="analytics-main">
          <div className="analytics-container">
            <div className="error-message">{error}</div>
            <button onClick={loadAnalytics} className="btn-retry">Retry</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!analytics) {
    return null
  }

  return (
    <div className="analytics-page">
      <Header />
      <main className="analytics-main">
        <div className="analytics-container">
          <div className="analytics-header">
            <h1>{viewMode === 'platform' ? 'Platform Analytics' : 'My Analytics'}</h1>
            <div className="analytics-controls">
              <select value={period} onChange={(e) => setPeriod(e.target.value)} className="period-select">
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
                <option value="all">All time</option>
              </select>
              {isAdmin && (
                <button
                  onClick={() => setViewMode(viewMode === 'platform' ? 'user' : 'platform')}
                  className="btn-toggle-view"
                >
                  {viewMode === 'platform' ? 'View My Analytics' : 'View Platform Analytics'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {/* Summary Cards */}
          <div className="analytics-summary">
            {viewMode === 'platform' ? (
              <>
                <div className="summary-card">
                  <div className="summary-label">Total Topics</div>
                  <div className="summary-value">{analytics.summary?.totalTopics || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Users</div>
                  <div className="summary-value">{analytics.summary?.totalUsers || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Comments</div>
                  <div className="summary-value">{analytics.summary?.totalComments || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Votes</div>
                  <div className="summary-value">{analytics.summary?.totalVotes || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Views</div>
                  <div className="summary-value">{analytics.summary?.totalViews || 0}</div>
                </div>
              </>
            ) : (
              <>
                <div className="summary-card">
                  <div className="summary-label">Topics</div>
                  <div className="summary-value">{analytics.summary?.topicsCount || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Comments</div>
                  <div className="summary-value">{analytics.summary?.commentsCount || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Views</div>
                  <div className="summary-value">{analytics.summary?.totalViews || 0}</div>
                </div>
                <div className="summary-card">
                  <div className="summary-label">Total Votes</div>
                  <div className="summary-value">{analytics.summary?.totalVotes || 0}</div>
                </div>
              </>
            )}
          </div>

          {/* Charts */}
          {viewMode === 'platform' ? (
            <>
              {/* Daily Activity Chart */}
              {analytics.dailyActivity && analytics.dailyActivity.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Daily Activity (Topics Created)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip labelFormatter={formatDate} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#006EB6" strokeWidth={2} name="Topics Created" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Topics by Category */}
              {analytics.topicsByCategory && analytics.topicsByCategory.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Topics by Category</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topicsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#006EB6" name="Topics" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Topics by Status */}
              {analytics.topicsByStatus && Object.keys(analytics.topicsByStatus).length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Topics by Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.topicsByStatus).map(([status, count]) => ({ name: status, value: count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics.topicsByStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Topics by Views */}
              {analytics.topTopicsByViews && analytics.topTopicsByViews.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Top Topics by Views</h2>
                  <div className="top-topics-list">
                    {analytics.topTopicsByViews.map((topic, index) => (
                      <div key={topic.id} className="topic-item" onClick={() => navigate(`/topic/${topic.id}`)}>
                        <div className="topic-rank">#{index + 1}</div>
                        <div className="topic-info">
                          <div className="topic-title">{topic.title}</div>
                          <div className="topic-stats">
                            <span>👁️ {topic.views || 0}</span>
                            <span>👍 {topic.votes || 0}</span>
                            <span>💬 {topic.comment_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Users */}
              {analytics.topUsers && analytics.topUsers.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Top Contributors</h2>
                  <div className="top-users-list">
                    {analytics.topUsers.map((user, index) => (
                      <div key={user.id} className="user-item" onClick={() => navigate(`/contributor/${user.id}`)}>
                        <div className="user-rank">#{index + 1}</div>
                        <div className="user-info">
                          <div className="user-name">{user.name}</div>
                          <div className="user-stats">
                            <span>📝 {user.topicCount} topics</span>
                            <span>👁️ {user.totalViews} views</span>
                            <span>👍 {user.totalVotes} votes</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Daily Activity Chart */}
              {analytics.dailyActivity && analytics.dailyActivity.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Daily Activity (Topics Created)</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip labelFormatter={formatDate} />
                      <Legend />
                      <Line type="monotone" dataKey="count" stroke="#006EB6" strokeWidth={2} name="Topics Created" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Views Over Time */}
              {analytics.viewsOverTime && analytics.viewsOverTime.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Views Over Time</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.viewsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={formatDate} />
                      <YAxis />
                      <Tooltip labelFormatter={formatDate} />
                      <Legend />
                      <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} name="Views" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Topics by Status */}
              {analytics.topicsByStatus && Object.keys(analytics.topicsByStatus).length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Topics by Status</h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={Object.entries(analytics.topicsByStatus).map(([status, count]) => ({ name: status, value: count }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(analytics.topicsByStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Topics */}
              {analytics.topics && analytics.topics.length > 0 && (
                <div className="analytics-section">
                  <h2 className="section-title">Your Topics</h2>
                  <div className="topics-list">
                    {analytics.topics.map(topic => (
                      <div key={topic.id} className="topic-item" onClick={() => navigate(`/topic/${topic.id}`)}>
                        <div className="topic-info">
                          <div className="topic-title">{topic.title}</div>
                          <div className="topic-stats">
                            <span>👁️ {topic.views || 0}</span>
                            <span>👍 {topic.votes || 0}</span>
                            <span>💬 {topic.comment_count || 0}</span>
                            <span className="topic-status">{topic.status || 'pending'}</span>
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

export default AnalyticsPage



