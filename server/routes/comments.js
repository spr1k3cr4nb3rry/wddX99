import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { notifyNewComment, notifyReply } from '../utils/notifications.js'

const router = express.Router()

// Get all comments for a topic
router.get('/topic/:topicId', optionalAuth, async (req, res) => {
  try {
    const { topicId } = req.params
    const userId = req.user?.userId || req.user?.id

    // Check if parent_id and deleted_at columns exist
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'comments' 
      AND column_name IN ('parent_id', 'deleted_at')
    `)
    const hasParentId = columnCheck.rows.some(r => r.column_name === 'parent_id')
    const hasDeletedAt = columnCheck.rows.some(r => r.column_name === 'deleted_at')

    // Build query based on available columns
    let topLevelQuery = `
      SELECT c.*, u.name as user_name, u.email as user_email
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.topic_id = $1
    `
    if (hasParentId) {
      topLevelQuery += ' AND c.parent_id IS NULL'
    }
    if (hasDeletedAt) {
      topLevelQuery += ' AND c.deleted_at IS NULL'
    }
    topLevelQuery += ' ORDER BY c.created_at DESC'

    const result = await pool.query(topLevelQuery, [topicId])

    // Get replies for each comment (only if parent_id column exists)
    const comments = await Promise.all(
      result.rows.map(async (comment) => {
        let replies = []
        if (hasParentId) {
          let repliesQuery = `
            SELECT c.*, u.name as user_name, u.email as user_email
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.parent_id = $1
          `
          if (hasDeletedAt) {
            repliesQuery += ' AND c.deleted_at IS NULL'
          }
          repliesQuery += ' ORDER BY c.created_at ASC'
          
          const repliesResult = await pool.query(repliesQuery, [comment.id])
          replies = repliesResult.rows
        }

        const formattedReplies = replies.map(reply => ({
          id: reply.id,
          author: {
            name: reply.user_name || 'Anonymous',
            avatar: reply.user_email && reply.user_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.user_name)}&background=006EB6&color=fff` : '/images/placeholder.svg'
          },
          content: reply.content,
          createdAt: reply.created_at,
          updatedAt: reply.updated_at,
          isOwner: userId && reply.user_id === userId
        }))

        return {
          id: comment.id,
          author: {
            name: comment.user_name || 'Anonymous',
            avatar: comment.user_email && comment.user_name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user_name)}&background=006EB6&color=fff` : '/images/placeholder.svg'
          },
          content: comment.content,
          createdAt: comment.created_at,
          updatedAt: comment.updated_at,
          replies: formattedReplies,
          isOwner: userId && comment.user_id === userId
        }
      })
    )

    res.json(comments)
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { topicId, content, parentId } = req.body
    const userId = req.user.userId

    if (!topicId || !content || !content.trim()) {
      return res.status(400).json({ error: 'Topic ID and content are required' })
    }

    // Verify topic exists
    const topicCheck = await pool.query('SELECT id FROM topics WHERE id = $1', [topicId])
    if (topicCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    // If parentId is provided, verify it exists and belongs to the same topic
    if (parentId) {
      const parentCheck = await pool.query(
        'SELECT id, topic_id FROM comments WHERE id = $1 AND deleted_at IS NULL',
        [parentId]
      )
      if (parentCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Parent comment not found' })
      }
      if (parentCheck.rows[0].topic_id !== parseInt(topicId)) {
        return res.status(400).json({ error: 'Parent comment does not belong to this topic' })
      }
    }

    // Insert comment
    const result = await pool.query(
      `INSERT INTO comments (topic_id, user_id, parent_id, content, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [topicId, userId, parentId || null, content.trim()]
    )

    // Update comment count on topic (only for top-level comments)
    if (!parentId) {
      await pool.query(
        'UPDATE topics SET comment_count = comment_count + 1 WHERE id = $1',
        [topicId]
      )
    }

    // Get user info
    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId])
    const user = userResult.rows[0]
    const newCommentId = result.rows[0].id

    // Create notifications
    if (parentId) {
      // This is a reply - notify the parent comment author
      const parentComment = await pool.query('SELECT user_id FROM comments WHERE id = $1', [parentId])
      if (parentComment.rows.length > 0 && parentComment.rows[0].user_id !== userId) {
        const topicResult = await pool.query('SELECT title FROM topics WHERE id = $1', [topicId])
        const topicTitle = topicResult.rows[0]?.title || 'a topic'
        await notifyReply(parentComment.rows[0].user_id, topicId, topicTitle, user.name, newCommentId)
      }
    } else {
      // This is a new comment - notify the topic author
      const topicResult = await pool.query('SELECT user_id, title FROM topics WHERE id = $1', [topicId])
      if (topicResult.rows.length > 0 && topicResult.rows[0].user_id !== userId) {
        await notifyNewComment(topicResult.rows[0].user_id, topicId, topicResult.rows[0].title, user.name, newCommentId)
      }
    }

    const comment = {
      id: result.rows[0].id,
      author: {
        name: user.name,
        avatar: user.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=006EB6&color=fff` : '/images/placeholder.svg'
      },
      content: result.rows[0].content,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      replies: [],
      isOwner: true
    }

    res.status(201).json(comment)
  } catch (error) {
    console.error('Create comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a comment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { content } = req.body
    const userId = req.user.userId

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' })
    }

    // Check if comment exists and user owns it
    const commentCheck = await pool.query(
      'SELECT user_id FROM comments WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const isOwner = commentCheck.rows[0].user_id === userId
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to edit this comment' })
    }

    // Update comment
    const result = await pool.query(
      `UPDATE comments 
       SET content = $1, updated_at = NOW()
       WHERE id = $2 AND deleted_at IS NULL
       RETURNING *`,
      [content.trim(), id]
    )

    // Get user info
    const userResult = await pool.query('SELECT name, email FROM users WHERE id = $1', [userId])
    const user = userResult.rows[0]

    const comment = {
      id: result.rows[0].id,
      author: {
        name: user.name,
        avatar: user.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=006EB6&color=fff` : '/images/placeholder.svg'
      },
      content: result.rows[0].content,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
      isOwner: true
    }

    res.json(comment)
  } catch (error) {
    console.error('Update comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a comment (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if comment exists
    const commentCheck = await pool.query(
      'SELECT user_id, topic_id, parent_id FROM comments WHERE id = $1 AND deleted_at IS NULL',
      [id]
    )

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    const comment = commentCheck.rows[0]
    const isOwner = comment.user_id === userId
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to delete this comment' })
    }

    // Soft delete comment
    await pool.query(
      'UPDATE comments SET deleted_at = NOW() WHERE id = $1',
      [id]
    )

    // Update comment count on topic (only for top-level comments)
    if (!comment.parent_id) {
      await pool.query(
        'UPDATE topics SET comment_count = GREATEST(comment_count - 1, 0) WHERE id = $1',
        [comment.topic_id]
      )
    }

    res.json({ success: true, message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

