import express from 'express'
import pool from '../config/database.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()

// Get all notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id
    
    if (!userId) {
      console.error('No userId found in req.user:', req.user)
      return res.status(401).json({ error: 'User ID not found' })
    }

    const { unread_only, limit = 50, offset = 0 } = req.query

    let query = `SELECT * FROM notifications WHERE user_id = $1`
    const params = [userId]
    let paramCount = 2

    if (unread_only === 'true') {
      query += ` AND read = false`
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`
    params.push(parseInt(limit))
    params.push(parseInt(offset))

    const result = await pool.query(query, params)

    // Get unread count
    const unreadCount = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    )

    res.json({
      notifications: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count),
      total: result.rows.length
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Get unread count
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id
    
    if (!userId) {
      console.error('No userId found in req.user:', req.user)
      return res.status(401).json({ error: 'User ID not found' })
    }

    const result = await pool.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND read = false',
      [userId]
    )

    res.json({ count: parseInt(result.rows[0].count) })
  } catch (error) {
    console.error('Get unread count error:', error)
    console.error('Error stack:', error.stack)
    res.status(500).json({ error: 'Internal server error', details: error.message })
  }
})

// Mark notification as read
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId || req.user.id

    // Verify notification belongs to user
    const notification = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (notification.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    await pool.query(
      'UPDATE notifications SET read = true, updated_at = NOW() WHERE id = $1',
      [id]
    )

    res.json({ message: 'Notification marked as read' })
  } catch (error) {
    console.error('Mark notification as read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark all notifications as read
router.put('/read-all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id

    await pool.query(
      'UPDATE notifications SET read = true, updated_at = NOW() WHERE user_id = $1 AND read = false',
      [userId]
    )

    res.json({ message: 'All notifications marked as read' })
  } catch (error) {
    console.error('Mark all notifications as read error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId || req.user.id

    // Verify notification belongs to user
    const notification = await pool.query(
      'SELECT * FROM notifications WHERE id = $1 AND user_id = $2',
      [id, userId]
    )

    if (notification.rows.length === 0) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    await pool.query('DELETE FROM notifications WHERE id = $1', [id])

    res.json({ message: 'Notification deleted' })
  } catch (error) {
    console.error('Delete notification error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete all read notifications
router.delete('/read/all', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id

    await pool.query(
      'DELETE FROM notifications WHERE user_id = $1 AND read = true',
      [userId]
    )

    res.json({ message: 'All read notifications deleted' })
  } catch (error) {
    console.error('Delete all read notifications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router



