import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { canComment } from '../../../utils/permissions'
import { commentsAPI } from '../../../services/api'
import './CommentsSection.css'

function CommentsSection({ topicId, comments: initialComments = [] }) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')

  // Load comments from API
  useEffect(() => {
    loadComments()
  }, [topicId])

  const loadComments = async () => {
    if (!topicId) {
      setLoading(false)
      return
    }
    
    setLoading(true)
    setError('')
    try {
      const data = await commentsAPI.getByTopic(topicId)
      // Ensure data is an array
      setComments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading comments:', err)
      const errorMessage = err.message || 'Failed to load comments'
      setError(errorMessage)
      // Fallback to initial comments if API fails
      if (initialComments && initialComments.length > 0) {
        setComments(initialComments)
      } else {
        setComments([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    if (!canComment(user)) {
      alert('Please login to comment')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const comment = await commentsAPI.create(topicId, newComment)
      setComments([comment, ...comments])
      setNewComment('')
    } catch (err) {
      setError(err.message || 'Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId, e) => {
    e.preventDefault()
    if (!replyText.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const reply = await commentsAPI.create(topicId, replyText, parentId)
      setComments(comments.map(comment => {
        if (comment.id === parentId) {
          return { ...comment, replies: [...(comment.replies || []), reply] }
        }
        return comment
      }))
      setReplyText('')
      setReplyingTo(null)
    } catch (err) {
      setError(err.message || 'Failed to post reply')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditComment = async (commentId, isReply = false, parentId = null) => {
    if (!editText.trim()) {
      setEditingId(null)
      setEditText('')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const updated = await commentsAPI.update(commentId, editText)
      
      if (isReply && parentId) {
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId ? updated : reply
              )
            }
          }
          return comment
        }))
      } else {
        setComments(comments.map(comment =>
          comment.id === commentId ? updated : comment
        ))
      }
      
      setEditingId(null)
      setEditText('')
    } catch (err) {
      setError(err.message || 'Failed to update comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteComment = async (commentId, isReply = false, parentId = null) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await commentsAPI.delete(commentId)
      
      if (isReply && parentId) {
        setComments(comments.map(comment => {
          if (comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.filter(reply => reply.id !== commentId)
            }
          }
          return comment
        }))
      } else {
        setComments(comments.filter(comment => comment.id !== commentId))
      }
    } catch (err) {
      setError(err.message || 'Failed to delete comment')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <section id="comments" className="comments-section">
      <h2 className="comments-title">Discussion & Comments</h2>
      <p className="comments-subtitle">
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
      </p>

      {error && (
        <div className="comment-error" style={{ color: 'red', marginBottom: '1rem' }}>
          {error}
        </div>
      )}

      {canComment(user) ? (
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <textarea
            className="comment-input"
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={4}
            disabled={submitting}
          />
          <button type="submit" className="comment-submit-btn" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      ) : (
        <div className="comment-login-prompt">
          <div className="login-prompt-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className="login-prompt-content">
            <h3 className="login-prompt-title">Join the Discussion</h3>
            <p className="login-prompt-text">
              To participate in this scholarly discussion and share your insights, please 
              <a href="#login" className="login-prompt-link"> sign in</a> or 
              <a href="#register" className="login-prompt-link"> create an account</a>.
            </p>
          </div>
        </div>
      )}

      <div className="comments-list">
        {loading ? (
          <p className="no-comments">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <img 
                  src={comment.author.avatar} 
                  alt={comment.author.name}
                  className="comment-avatar"
                />
                <div className="comment-author-info">
                  <span className="comment-author-name">{comment.author.name}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                {comment.isOwner && (
                  <div className="comment-actions">
                    <button
                      className="comment-edit-btn"
                      onClick={() => {
                        setEditingId(comment.id)
                        setEditText(comment.content)
                      }}
                      disabled={submitting}
                    >
                      Edit
                    </button>
                    <button
                      className="comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              {editingId === comment.id ? (
                <div className="comment-edit-form">
                  <textarea
                    className="comment-input"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    disabled={submitting}
                  />
                  <div className="comment-edit-actions">
                    <button
                      type="button"
                      className="comment-save-btn"
                      onClick={() => handleEditComment(comment.id)}
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="comment-cancel-btn"
                      onClick={() => {
                        setEditingId(null)
                        setEditText('')
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
              )}
              {canComment(user) && editingId !== comment.id && (
                <button 
                  className="comment-reply-btn"
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  disabled={submitting}
                >
                  Reply
                </button>
              )}
              
              {replyingTo === comment.id && (
                <form 
                  className="reply-form"
                  onSubmit={(e) => handleSubmitReply(comment.id, e)}
                >
                  <textarea
                    className="reply-input"
                    placeholder="Write a reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    disabled={submitting}
                  />
                  <div className="reply-actions">
                    <button type="submit" className="reply-submit-btn" disabled={submitting}>
                      {submitting ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button 
                      type="button"
                      className="reply-cancel-btn"
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText('')
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <img 
                          src={reply.author.avatar} 
                          alt={reply.author.name}
                          className="reply-avatar"
                        />
                        <div className="reply-author-info">
                          <span className="reply-author-name">{reply.author.name}</span>
                          <span className="reply-date">{formatDate(reply.createdAt)}</span>
                        </div>
                        {reply.isOwner && (
                          <div className="reply-actions">
                            <button
                              className="reply-edit-btn"
                              onClick={() => {
                                setEditingId(reply.id)
                                setEditText(reply.content)
                              }}
                              disabled={submitting}
                            >
                              Edit
                            </button>
                            <button
                              className="reply-delete-btn"
                              onClick={() => handleDeleteComment(reply.id, true, comment.id)}
                              disabled={submitting}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      {editingId === reply.id ? (
                        <div className="reply-edit-form">
                          <textarea
                            className="reply-input"
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            rows={2}
                            disabled={submitting}
                          />
                          <div className="reply-edit-actions">
                            <button
                              type="button"
                              className="reply-save-btn"
                              onClick={() => handleEditComment(reply.id, true, comment.id)}
                              disabled={submitting}
                            >
                              {submitting ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              className="reply-cancel-btn"
                              onClick={() => {
                                setEditingId(null)
                                setEditText('')
                              }}
                              disabled={submitting}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="reply-content">
                          <p>{reply.content}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default CommentsSection

