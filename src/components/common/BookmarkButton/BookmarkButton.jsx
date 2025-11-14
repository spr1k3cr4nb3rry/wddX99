import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { bookmarksAPI } from '../../../services/api'
import './BookmarkButton.css'

function BookmarkButton({ topicId, onToggle }) {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [bookmarkCount, setBookmarkCount] = useState(0)

  useEffect(() => {
    if (user && topicId) {
      loadBookmarkStatus()
      loadBookmarkCount()
    }
  }, [user, topicId])

  const loadBookmarkStatus = async () => {
    try {
      const result = await bookmarksAPI.check(topicId)
      setIsBookmarked(result.isBookmarked)
    } catch (error) {
      console.error('Error checking bookmark status:', error)
    }
  }

  const loadBookmarkCount = async () => {
    try {
      const result = await bookmarksAPI.getCount(topicId)
      setBookmarkCount(result.count)
    } catch (error) {
      console.error('Error loading bookmark count:', error)
    }
  }

  const handleToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      alert('Please login to bookmark topics')
      return
    }

    setLoading(true)
    try {
      if (isBookmarked) {
        await bookmarksAPI.remove(topicId)
        setIsBookmarked(false)
        setBookmarkCount(prev => Math.max(0, prev - 1))
      } else {
        await bookmarksAPI.add(topicId)
        setIsBookmarked(true)
        setBookmarkCount(prev => prev + 1)
      }
      if (onToggle) {
        onToggle(!isBookmarked)
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error)
      alert(error.message || 'Failed to update bookmark')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <button
        className="bookmark-button disabled"
        title="Login to bookmark"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          alert('Please login to bookmark topics')
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        {bookmarkCount > 0 && <span className="bookmark-count">{bookmarkCount}</span>}
      </button>
    )
  }

  return (
    <button
      className={`bookmark-button ${isBookmarked ? 'bookmarked' : ''} ${loading ? 'loading' : ''}`}
      onClick={handleToggle}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this topic'}
      disabled={loading}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill={isBookmarked ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
      </svg>
      {bookmarkCount > 0 && <span className="bookmark-count">{bookmarkCount}</span>}
    </button>
  )
}

export default BookmarkButton



