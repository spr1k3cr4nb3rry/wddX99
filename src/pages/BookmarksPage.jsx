import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import TopicList from '../components/topics/TopicList/TopicList'
import { useAuth } from '../context/AuthContext'
import { bookmarksAPI } from '../services/api'
import './BookmarksPage.css'

function BookmarksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/topics')
      return
    }
    loadBookmarks()
  }, [user, navigate])

  const loadBookmarks = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await bookmarksAPI.getAll()
      // Transform bookmark data to match topic format
      const topics = data.map(bookmark => ({
        id: bookmark.topic_id,
        title: bookmark.title,
        description: bookmark.description,
        category: bookmark.category,
        tags: bookmark.tags || [],
        image: bookmark.image,
        votes: bookmark.votes || 0,
        comments: bookmark.comments || 0,
        commentsCount: bookmark.comments || 0,
        views: bookmark.views || 0,
        readTime: bookmark.read_time || 5,
        status: bookmark.status,
        createdAt: bookmark.created_at,
        updatedAt: bookmark.updated_at,
        author: {
          name: bookmark.user_name,
          email: bookmark.user_email,
        },
        bookmarkedAt: bookmark.bookmarked_at,
      }))
      setBookmarks(topics)
    } catch (err) {
      setError('Failed to load bookmarks')
      console.error('Error loading bookmarks:', err)
      setBookmarks([])
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="bookmarks-page">
      <Header />
      <main className="bookmarks-main">
        <div className="bookmarks-container">
          <div className="bookmarks-header">
            <h1>My Bookmarks</h1>
            <p className="bookmarks-subtitle">
              Topics you've saved for later reading
            </p>
          </div>

          {loading ? (
            <div className="bookmarks-loading">
              <p>Loading bookmarks...</p>
            </div>
          ) : error ? (
            <div className="bookmarks-error">
              <p>{error}</p>
              <button onClick={loadBookmarks} className="btn-retry">Retry</button>
            </div>
          ) : bookmarks.length === 0 ? (
            <div className="bookmarks-empty">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
              </svg>
              <h2>No bookmarks yet</h2>
              <p>Start bookmarking topics you want to read later!</p>
              <button onClick={() => navigate('/topics')} className="btn-primary">
                Browse Topics
              </button>
            </div>
          ) : (
            <>
              <div className="bookmarks-stats">
                <p>{bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}</p>
              </div>
              <TopicList
                topics={bookmarks}
                viewMode="grid"
                filters={{}}
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default BookmarksPage



