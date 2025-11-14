import express from 'express'
import pool from '../config/database.js'
import { optionalAuth, authenticateToken } from '../middleware/auth.js'
import { requireAuth, requireEducator, requireAdmin } from '../middleware/permissions.js'
import { notifyTopicApproved, notifyTopicRejected } from '../utils/notifications.js'

const router = express.Router()

// Get all topics (only show approved topics to non-admins)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      category, 
      search, 
      sortBy, 
      author, 
      status, 
      dateFrom, 
      dateTo,
      tags,
      minVotes,
      minViews
    } = req.query
    const isAdmin = req.user?.role === 'admin'

    let query = `SELECT t.*, u.name as user_name, u.email as user_email
                 FROM topics t 
                 LEFT JOIN users u ON t.user_id = u.id 
                 WHERE 1=1`
    const params = []
    let paramCount = 1

    // Non-admins only see approved/published topics
    if (!isAdmin) {
      query += ` AND (t.approved = true OR t.status = 'published')`
    }

    // Filter by category
    if (category && category !== 'All') {
      query += ` AND t.category = $${paramCount}`
      params.push(category)
      paramCount++
    }

    // Enhanced search functionality - searches title, description, abstract, tags, and author
    if (search) {
      query += ` AND (
        t.title ILIKE $${paramCount} OR 
        t.description ILIKE $${paramCount} OR 
        COALESCE(t.abstract, '') ILIKE $${paramCount} OR
        t.tags::text ILIKE $${paramCount} OR
        u.name ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
      paramCount++
    }

    // Filter by author
    if (author) {
      query += ` AND u.name ILIKE $${paramCount}`
      params.push(`%${author}%`)
      paramCount++
    }

    // Filter by status (admin only)
    if (status && isAdmin) {
      query += ` AND t.status = $${paramCount}`
      params.push(status)
      paramCount++
    }

    // Filter by date range
    if (dateFrom) {
      query += ` AND t.created_at >= $${paramCount}`
      params.push(dateFrom)
      paramCount++
    }
    if (dateTo) {
      query += ` AND t.created_at <= $${paramCount}`
      params.push(dateTo + ' 23:59:59')
      paramCount++
    }

    // Filter by tags
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',')
      query += ' AND ('
      tagArray.forEach((tag, index) => {
        if (index > 0) query += ' OR '
        query += `t.tags::text ILIKE $${paramCount}`
        params.push(`%"${tag.trim()}"%`)
        paramCount++
      })
      query += ')'
    }

    // Filter by minimum votes
    if (minVotes) {
      query += ` AND COALESCE(t.votes, 0) >= $${paramCount}`
      params.push(parseInt(minVotes))
      paramCount++
    }

    // Filter by minimum views
    if (minViews) {
      query += ` AND COALESCE(t.views, 0) >= $${paramCount}`
      params.push(parseInt(minViews))
      paramCount++
    }

    // Enhanced sorting
    switch (sortBy) {
      case 'newest':
        query += ' ORDER BY t.created_at DESC'
        break
      case 'oldest':
        query += ' ORDER BY t.created_at ASC'
        break
      case 'updated':
        query += ' ORDER BY t.updated_at DESC NULLS LAST, t.created_at DESC'
        break
      case 'popular':
        query += ' ORDER BY COALESCE(t.views, 0) DESC, COALESCE(t.votes, 0) DESC'
        break
      case 'most-voted':
        query += ' ORDER BY COALESCE(t.votes, 0) DESC, COALESCE(t.views, 0) DESC'
        break
      case 'trending':
        query += ' ORDER BY (COALESCE(t.votes, 0) + COALESCE(t.comment_count, 0) * 2 + COALESCE(t.views, 0) / 10) DESC, t.created_at DESC'
        break
      case 'alphabetical':
        query += ' ORDER BY t.title ASC'
        break
      case 'relevance':
        // Relevance based on search term (if provided)
        if (search) {
          query += ` ORDER BY 
            CASE 
              WHEN t.title ILIKE $${paramCount} THEN 1
              WHEN t.description ILIKE $${paramCount} THEN 2
              WHEN COALESCE(t.abstract, '') ILIKE $${paramCount} THEN 3
              ELSE 4
            END,
            COALESCE(t.votes, 0) DESC,
            COALESCE(t.views, 0) DESC`
          params.push(`%${search}%`)
          params.push(`%${search}%`)
          params.push(`%${search}%`)
        } else {
          query += ' ORDER BY t.created_at DESC'
        }
        break
      default:
        query += ' ORDER BY t.created_at DESC'
    }

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get topics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single topic
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const isAdmin = req.user?.role === 'admin'

    let query = `SELECT t.*, u.name as user_name 
                 FROM topics t 
                 LEFT JOIN users u ON t.user_id = u.id 
                 WHERE t.id = $1`
    const params = [id]

    // Non-admins only see approved topics
    if (!isAdmin) {
      query += ' AND t.approved = true'
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Get topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create topic (requires authentication - any logged-in user can create)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, tags, image, abstract, status, content, authorBio, visualizations, contentBlocks, customizationSettings } = req.body
    const userId = req.user.userId

    // Topics created by regular users need approval, admin posts are auto-approved
    // Status can be: 'draft', 'pending', 'published', 'approved', 'rejected'
    const topicStatus = status || (req.user.role === 'admin' ? 'published' : 'pending')
    const approved = topicStatus === 'published' || topicStatus === 'approved' || req.user.role === 'admin'
    const approvedBy = approved ? userId : null

    // Prepare content JSONB (sections and references)
    const contentJson = content ? JSON.stringify(content) : null

    // Prepare visualizations JSONB
    const visualizationsJson = visualizations && visualizations.length > 0 ? JSON.stringify(visualizations) : null

    // Prepare content blocks JSONB
    const contentBlocksJson = contentBlocks && contentBlocks.length > 0 ? JSON.stringify(contentBlocks) : null

    // Prepare customization settings JSONB
    const customizationJson = customizationSettings ? JSON.stringify(customizationSettings) : null

    const result = await pool.query(
      `INSERT INTO topics (title, description, category, tags, image, user_id, abstract, author_bio, content, visualizations, content_blocks, customization_settings, status, approved, approved_by, approved_at, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, ${approved ? 'NOW()' : 'NULL'}, NOW())
       RETURNING *`,
      [title, description, category, JSON.stringify(tags || []), image, userId, abstract || null, authorBio || null, contentJson, visualizationsJson, contentBlocksJson, customizationJson, topicStatus, approved, approvedBy]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update topic
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, category, tags, image, abstract, authorBio, content, visualizations, contentBlocks, customizationSettings } = req.body
    const userId = req.user?.userId

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Check if topic exists and user has permission
    const topicCheck = await pool.query('SELECT user_id FROM topics WHERE id = $1', [id])
    if (topicCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    const isAdmin = req.user.role === 'admin'
    const isOwner = topicCheck.rows[0].user_id === userId

    if (!isAdmin && !isOwner) {
      return res.status(403).json({ error: 'You do not have permission to edit this topic' })
    }

    // Prepare content JSONB
    const contentJson = content ? JSON.stringify(content) : null

    // Prepare visualizations JSONB
    const visualizationsJson = visualizations && visualizations.length > 0 ? JSON.stringify(visualizations) : null

    // Prepare content blocks JSONB
    const contentBlocksJson = contentBlocks && contentBlocks.length > 0 ? JSON.stringify(contentBlocks) : null

    // Prepare customization settings JSONB
    const customizationJson = customizationSettings ? JSON.stringify(customizationSettings) : null

    // Only owner or admin can update
    let query = `UPDATE topics 
       SET title = $1, description = $2, category = $3, tags = $4, image = $5, 
           abstract = $6, author_bio = $7, content = $8, visualizations = $9, content_blocks = $10, customization_settings = $11, updated_at = NOW()
       WHERE id = $12`
    const params = [
      title, 
      description, 
      category, 
      JSON.stringify(tags || []), 
      image || null,
      abstract || null,
      authorBio || null,
      contentJson,
      visualizationsJson,
      contentBlocksJson,
      customizationJson,
      id
    ]

    query += ' RETURNING *'

    const result = await pool.query(query, params)

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Vote on topic (requires authentication - any logged in user)
router.post('/:id/vote', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Check if user already voted
    const voteCheck = await pool.query(
      'SELECT id FROM votes WHERE topic_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (voteCheck.rows.length > 0) {
      // Remove vote
      await pool.query(
        'DELETE FROM votes WHERE topic_id = $1 AND user_id = $2',
        [id, userId]
      )
      await pool.query(
        'UPDATE topics SET votes = votes - 1 WHERE id = $1',
        [id]
      )
      return res.json({ message: 'Vote removed', voted: false })
    } else {
      // Add vote
      await pool.query(
        'INSERT INTO votes (topic_id, user_id) VALUES ($1, $2)',
        [id, userId]
      )
      await pool.query(
        'UPDATE topics SET votes = votes + 1 WHERE id = $1',
        [id]
      )
      return res.json({ message: 'Vote added', voted: true })
    }
  } catch (error) {
    console.error('Vote error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Approve topic (admin only)
router.post('/:id/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const result = await pool.query(
      `UPDATE topics 
       SET approved = true, approved_by = $1, approved_at = NOW(), status = 'published'
       WHERE id = $2
       RETURNING *`,
      [userId, id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    const topic = result.rows[0]

    // Create notification for topic author
    if (topic.user_id !== userId) {
      await notifyTopicApproved(topic.user_id, topic.id, topic.title)
    }

    res.json(topic)
  } catch (error) {
    console.error('Approve topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Reject topic (admin only)
router.post('/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `UPDATE topics 
       SET approved = false, approved_by = NULL, approved_at = NULL, status = 'rejected'
       WHERE id = $1
       RETURNING *`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Reject topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete topic (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      'DELETE FROM topics WHERE id = $1 RETURNING *',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Topic not found' })
    }

    res.json({ message: 'Topic deleted successfully' })
  } catch (error) {
    console.error('Delete topic error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
