import express from 'express'
import pool from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

/**
 * GET /api/bookmarks
 * Get all bookmarks for the current user
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    const result = await pool.query(
      `SELECT 
        b.id,
        b.created_at as bookmarked_at,
        t.id as topic_id,
        t.title,
        t.description,
        t.category,
        t.tags,
        t.image,
        t.votes,
        t.comment_count as comments,
        t.views,
        t.read_time,
        t.status,
        t.created_at,
        t.updated_at,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email
      FROM bookmarks b
      INNER JOIN topics t ON b.topic_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC`,
      [userId]
    )

    res.json(result.rows)
  } catch (error) {
    console.error('Error fetching bookmarks:', error)
    res.status(500).json({ error: 'Failed to fetch bookmarks' })
  }
})

/**
 * POST /api/bookmarks/:topicId
 * Add a bookmark for the current user
 */
router.post('/:topicId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const topicId = parseInt(req.params.topicId)

    // Check if topic exists
    const topicResult = await db.query('SELECT id FROM topics WHERE id = $1', [topicId])
    if (topicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    // Check if already bookmarked
    const existingBookmark = await db.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND topic_id = $2',
      [userId, topicId]
    )

    if (existingBookmark.rows.length > 0) {
      return res.status(400).json({ error: 'Topic already bookmarked' })
    }

    // Create bookmark
    const result = await pool.query(
      'INSERT INTO bookmarks (user_id, topic_id) VALUES ($1, $2) RETURNING *',
      [userId, topicId]
    )

    res.status(201).json({ 
      message: 'Topic bookmarked successfully',
      bookmark: result.rows[0]
    })
  } catch (error) {
    console.error('Error creating bookmark:', error)
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ error: 'Topic already bookmarked' })
    }
    res.status(500).json({ error: 'Failed to create bookmark' })
  }
})

/**
 * DELETE /api/bookmarks/:topicId
 * Remove a bookmark for the current user
 */
router.delete('/:topicId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const topicId = parseInt(req.params.topicId)

    const result = await pool.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND topic_id = $2 RETURNING *',
      [userId, topicId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bookmark not found' })
    }

    res.json({ message: 'Bookmark removed successfully' })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    res.status(500).json({ error: 'Failed to delete bookmark' })
  }
})

/**
 * GET /api/bookmarks/check/:topicId
 * Check if a topic is bookmarked by the current user
 */
router.get('/check/:topicId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId
    const topicId = parseInt(req.params.topicId)

    const result = await pool.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND topic_id = $2',
      [userId, topicId]
    )

    res.json({ isBookmarked: result.rows.length > 0 })
  } catch (error) {
    console.error('Error checking bookmark:', error)
    res.status(500).json({ error: 'Failed to check bookmark status' })
  }
})

/**
 * GET /api/bookmarks/count/:topicId
 * Get bookmark count for a topic
 */
router.get('/count/:topicId', async (req, res) => {
  try {
    const topicId = parseInt(req.params.topicId)

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM bookmarks WHERE topic_id = $1',
      [topicId]
    )

    res.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Error getting bookmark count:', error)
    res.status(500).json({ error: 'Failed to get bookmark count' })
  }
})

export default router

