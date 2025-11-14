import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { requireAdmin } from '../middleware/permissions.js'

const router = express.Router()

// Helper function to get date range
const getDateRange = (period = '30d') => {
  const now = new Date()
  let startDate = new Date()

  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7)
      break
    case '30d':
      startDate.setDate(now.getDate() - 30)
      break
    case '90d':
      startDate.setDate(now.getDate() - 90)
      break
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1)
      break
    case 'all':
      startDate = new Date(0) // Beginning of time
      break
    default:
      startDate.setDate(now.getDate() - 30)
  }

  return { startDate, endDate: now }
}

// Get platform-wide analytics (admin only)
router.get('/platform', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d' } = req.query
    const { startDate, endDate } = getDateRange(period)

    // Total topics
    const totalTopics = await pool.query(
      'SELECT COUNT(*) as count FROM topics WHERE created_at >= $1 AND created_at <= $2',
      [startDate, endDate]
    )

    // Total users
    const totalUsers = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= $1 AND created_at <= $2',
      [startDate, endDate]
    )

    // Total comments
    const totalComments = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE created_at >= $1 AND created_at <= $2 AND deleted_at IS NULL',
      [startDate, endDate]
    )

    // Total votes
    const totalVotes = await pool.query(
      'SELECT COALESCE(SUM(votes), 0) as total FROM topics WHERE created_at >= $1 AND created_at <= $2',
      [startDate, endDate]
    )

    // Total views
    const totalViews = await pool.query(
      'SELECT COALESCE(SUM(views), 0) as total FROM topics WHERE created_at >= $1 AND created_at <= $2',
      [startDate, endDate]
    )

    // Topics by status
    const topicsByStatus = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM topics 
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY status`,
      [startDate, endDate]
    )

    // Topics by category
    const topicsByCategory = await pool.query(
      `SELECT category, COUNT(*) as count 
       FROM topics 
       WHERE created_at >= $1 AND created_at <= $2 AND category IS NOT NULL
       GROUP BY category 
       ORDER BY count DESC 
       LIMIT 10`,
      [startDate, endDate]
    )

    // Top topics by views
    const topTopicsByViews = await pool.query(
      `SELECT id, title, views, votes, comment_count 
       FROM topics 
       WHERE created_at >= $1 AND created_at <= $2
       ORDER BY views DESC 
       LIMIT 10`,
      [startDate, endDate]
    )

    // Top topics by votes
    const topTopicsByVotes = await pool.query(
      `SELECT id, title, views, votes, comment_count 
       FROM topics 
       WHERE created_at >= $1 AND created_at <= $2
       ORDER BY votes DESC 
       LIMIT 10`,
      [startDate, endDate]
    )

    // Daily activity (topics created per day)
    const dailyActivity = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM topics 
       WHERE created_at >= $1 AND created_at <= $2
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [startDate, endDate]
    )

    // User engagement (top users by topics)
    const topUsers = await pool.query(
      `SELECT u.id, u.name, COUNT(t.id) as topic_count, 
              COALESCE(SUM(t.views), 0) as total_views,
              COALESCE(SUM(t.votes), 0) as total_votes
       FROM users u
       LEFT JOIN topics t ON u.id = t.user_id
       WHERE t.created_at >= $1 AND t.created_at <= $2 OR t.created_at IS NULL
       GROUP BY u.id, u.name
       HAVING COUNT(t.id) > 0
       ORDER BY topic_count DESC
       LIMIT 10`,
      [startDate, endDate]
    )

    res.json({
      period,
      summary: {
        totalTopics: parseInt(totalTopics.rows[0].count),
        totalUsers: parseInt(totalUsers.rows[0].count),
        totalComments: parseInt(totalComments.rows[0].count),
        totalVotes: parseInt(totalVotes.rows[0].total) || 0,
        totalViews: parseInt(totalViews.rows[0].total) || 0,
      },
      topicsByStatus: topicsByStatus.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count)
        return acc
      }, {}),
      topicsByCategory: topicsByCategory.rows.map(row => ({
        category: row.category,
        count: parseInt(row.count)
      })),
      topTopicsByViews: topTopicsByViews.rows,
      topTopicsByVotes: topTopicsByVotes.rows,
      dailyActivity: dailyActivity.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      })),
      topUsers: topUsers.rows.map(row => ({
        id: row.id,
        name: row.name,
        topicCount: parseInt(row.topic_count),
        totalViews: parseInt(row.total_views) || 0,
        totalVotes: parseInt(row.total_votes) || 0
      }))
    })
  } catch (error) {
    console.error('Get platform analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user-specific analytics
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params
    const { period = '30d' } = req.query
    const { startDate, endDate } = getDateRange(period)
    const currentUserId = req.user.userId || req.user.id
    const isAdmin = req.user.role === 'admin'

    // Check if user can view this analytics
    if (parseInt(userId) !== currentUserId && !isAdmin) {
      return res.status(403).json({ error: 'You can only view your own analytics' })
    }

    // User's topics
    const userTopics = await pool.query(
      `SELECT id, title, views, votes, comment_count, created_at, status
       FROM topics 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
       ORDER BY created_at DESC`,
      [userId, startDate, endDate]
    )

    // User's comments
    const userComments = await pool.query(
      `SELECT COUNT(*) as count 
       FROM comments 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3 AND deleted_at IS NULL`,
      [userId, startDate, endDate]
    )

    // Total views on user's topics
    const totalViews = await pool.query(
      `SELECT COALESCE(SUM(views), 0) as total 
       FROM topics 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [userId, startDate, endDate]
    )

    // Total votes on user's topics
    const totalVotes = await pool.query(
      `SELECT COALESCE(SUM(votes), 0) as total 
       FROM topics 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3`,
      [userId, startDate, endDate]
    )

    // Daily activity (topics created per day)
    const dailyActivity = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM topics 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    )

    // Views over time for user's topics
    const viewsOverTime = await pool.query(
      `SELECT DATE(created_at) as date, SUM(views) as views 
       FROM topics 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [userId, startDate, endDate]
    )

    // Topics by status
    const topicsByStatus = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM topics 
       WHERE user_id = $1 AND created_at >= $2 AND created_at <= $3
       GROUP BY status`,
      [userId, startDate, endDate]
    )

    res.json({
      period,
      summary: {
        topicsCount: userTopics.rows.length,
        commentsCount: parseInt(userComments.rows[0].count),
        totalViews: parseInt(totalViews.rows[0].total) || 0,
        totalVotes: parseInt(totalVotes.rows[0].total) || 0,
      },
      topics: userTopics.rows,
      topicsByStatus: topicsByStatus.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count)
        return acc
      }, {}),
      dailyActivity: dailyActivity.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      })),
      viewsOverTime: viewsOverTime.rows.map(row => ({
        date: row.date,
        views: parseInt(row.views) || 0
      }))
    })
  } catch (error) {
    console.error('Get user analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get topic-specific analytics
router.get('/topic/:topicId', optionalAuth, async (req, res) => {
  try {
    const { topicId } = req.params
    const { period = '30d' } = req.query
    const { startDate, endDate } = getDateRange(period)

    // Get topic
    const topic = await pool.query('SELECT * FROM topics WHERE id = $1', [topicId])
    if (topic.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    // Comments over time
    const commentsOverTime = await pool.query(
      `SELECT DATE(created_at) as date, COUNT(*) as count 
       FROM comments 
       WHERE topic_id = $1 AND created_at >= $2 AND created_at <= $3 AND deleted_at IS NULL
       GROUP BY DATE(created_at) 
       ORDER BY date ASC`,
      [topicId, startDate, endDate]
    )

    // Votes over time (if we had a votes history table, but for now just return current votes)
    // This would require a votes_history table to track when votes were cast

    res.json({
      period,
      topic: topic.rows[0],
      commentsOverTime: commentsOverTime.rows.map(row => ({
        date: row.date,
        count: parseInt(row.count)
      }))
    })
  } catch (error) {
    console.error('Get topic analytics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router



