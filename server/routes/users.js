import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get user profile with statistics
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const currentUserId = req.user?.userId || req.user?.id
    const isOwnProfile = currentUserId && parseInt(id) === currentUserId

    const result = await pool.query(
      `SELECT id, name, email, role, bio, title, avatar, location, website, created_at, updated_at 
       FROM users WHERE id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = result.rows[0]

    // Get user's topics count (only approved/published for others)
    const topicsQuery = isOwnProfile
      ? 'SELECT COUNT(*) as count FROM topics WHERE user_id = $1'
      : 'SELECT COUNT(*) as count FROM topics WHERE user_id = $1 AND (approved = true OR status = \'published\')'
    
    const topicsCount = await pool.query(topicsQuery, [id])

    // Get user's comments count
    const commentsCount = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE user_id = $1 AND deleted_at IS NULL',
      [id]
    )

    // Get total votes received on user's topics
    const votesReceived = await pool.query(
      `SELECT COALESCE(SUM(votes), 0) as total FROM topics WHERE user_id = $1`,
      [id]
    )

    // Get total views on user's topics
    const viewsReceived = await pool.query(
      `SELECT COALESCE(SUM(views), 0) as total FROM topics WHERE user_id = $1`,
      [id]
    )

    // Get recent activity (last 5 topics)
    const recentTopics = await pool.query(
      `SELECT id, title, created_at, status, approved 
       FROM topics 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [id]
    )

    user.topicsCount = parseInt(topicsCount.rows[0].count)
    user.commentsCount = parseInt(commentsCount.rows[0].count)
    user.votesReceived = parseInt(votesReceived.rows[0].total) || 0
    user.viewsReceived = parseInt(viewsReceived.rows[0].total) || 0
    user.recentTopics = recentTopics.rows
    user.isOwnProfile = isOwnProfile

    res.json(user)
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's topics
router.get('/:id/topics', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const currentUserId = req.user?.userId || req.user?.id
    const isOwnProfile = currentUserId && parseInt(id) === currentUserId

    // If viewing own profile, show all topics. Otherwise, only show approved/published
    let query = 'SELECT t.*, u.name as user_name FROM topics t LEFT JOIN users u ON t.user_id = u.id WHERE t.user_id = $1'
    if (!isOwnProfile) {
      query += ' AND (t.approved = true OR t.status = \'published\')'
    }
    query += ' ORDER BY t.created_at DESC'

    const result = await pool.query(query, [id])
    res.json(result.rows)
  } catch (error) {
    console.error('Get user topics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user profile
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { name, bio, title, avatar, location, website } = req.body
    const userId = req.user.userId

    // Check if user is updating their own profile
    if (parseInt(id) !== userId) {
      return res.status(403).json({ error: 'You can only update your own profile' })
    }

    // Update user profile
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name),
           bio = COALESCE($2, bio),
           title = COALESCE($3, title),
           avatar = COALESCE($4, avatar),
           location = COALESCE($5, location),
           website = COALESCE($6, website),
           updated_at = NOW()
       WHERE id = $7
       RETURNING id, name, email, role, bio, title, avatar, location, website, created_at, updated_at`,
      [name, bio, title, avatar, location, website, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get current user's profile (dashboard data)
router.get('/me/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId

    // Get user profile
    const userResult = await pool.query(
      `SELECT id, name, email, role, bio, title, avatar, location, website, created_at, updated_at 
       FROM users WHERE id = $1`,
      [userId]
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const user = userResult.rows[0]

    // Get statistics
    const [topicsCount, commentsCount, votesReceived, viewsReceived] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM topics WHERE user_id = $1', [userId]),
      pool.query('SELECT COUNT(*) as count FROM comments WHERE user_id = $1 AND deleted_at IS NULL', [userId]),
      pool.query('SELECT COALESCE(SUM(votes), 0) as total FROM topics WHERE user_id = $1', [userId]),
      pool.query('SELECT COALESCE(SUM(views), 0) as total FROM topics WHERE user_id = $1', [userId])
    ])

    // Get topics by status
    const topicsByStatus = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM topics 
       WHERE user_id = $1 
       GROUP BY status`,
      [userId]
    )

    // Get recent topics
    const recentTopics = await pool.query(
      `SELECT id, title, created_at, status, approved, votes, views 
       FROM topics 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 5`,
      [userId]
    )

    // Get recent comments
    const recentComments = await pool.query(
      `SELECT c.id, c.content, c.created_at, t.id as topic_id, t.title as topic_title
       FROM comments c
       LEFT JOIN topics t ON c.topic_id = t.id
       WHERE c.user_id = $1 AND c.deleted_at IS NULL
       ORDER BY c.created_at DESC
       LIMIT 5`,
      [userId]
    )

    user.statistics = {
      topicsCount: parseInt(topicsCount.rows[0].count),
      commentsCount: parseInt(commentsCount.rows[0].count),
      votesReceived: parseInt(votesReceived.rows[0].total) || 0,
      viewsReceived: parseInt(viewsReceived.rows[0].total) || 0,
      topicsByStatus: topicsByStatus.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count)
        return acc
      }, {})
    }

    user.recentTopics = recentTopics.rows
    user.recentComments = recentComments.rows

    res.json(user)
  } catch (error) {
    console.error('Get dashboard error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

