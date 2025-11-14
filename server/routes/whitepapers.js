import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { requireAuth, requireAdmin } from '../middleware/permissions.js'

const router = express.Router()

// Get all whitepapers
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, category, tags, sortBy = 'alphabetical' } = req.query

    let query = `
      SELECT w.*, u.name as creator_name
      FROM whitepapers w
      LEFT JOIN users u ON w.created_by = u.id
      WHERE 1=1
    `
    const params = []
    let paramCount = 1

    // Search filter
    if (search) {
      query += ` AND (
        w.title ILIKE $${paramCount} OR 
        w.abstract ILIKE $${paramCount} OR 
        w.content ILIKE $${paramCount} OR
        w.author ILIKE $${paramCount}
      )`
      params.push(`%${search}%`)
      paramCount++
    }

    // Category filter
    if (category && category !== 'All') {
      query += ` AND w.category = $${paramCount}`
      params.push(category)
      paramCount++
    }

    // Tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',')
      query += ' AND ('
      tagArray.forEach((tag, index) => {
        if (index > 0) query += ' OR '
        query += `w.tags::text ILIKE $${paramCount}`
        params.push(`%"${tag.trim()}"%`)
        paramCount++
      })
      query += ')'
    }

    // Sorting
    switch (sortBy) {
      case 'alphabetical':
        query += ' ORDER BY w.title ASC'
        break
      case 'newest':
        query += ' ORDER BY w.created_at DESC'
        break
      case 'oldest':
        query += ' ORDER BY w.created_at ASC'
        break
      case 'updated':
        query += ' ORDER BY w.updated_at DESC NULLS LAST'
        break
      default:
        query += ' ORDER BY w.title ASC'
    }

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get whitepapers error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single whitepaper
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT w.*, u.name as creator_name 
       FROM whitepapers w
       LEFT JOIN users u ON w.created_by = u.id
       WHERE w.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Whitepaper not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Get whitepaper error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create whitepaper (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, abstract, content, author, citations, resources, tags, category } = req.body
    const userId = req.user.userId

    const result = await pool.query(
      `INSERT INTO whitepapers 
       (title, abstract, content, author, citations, resources, tags, category, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        title,
        abstract || null,
        content,
        author || null,
        JSON.stringify(citations || []),
        JSON.stringify(resources || []),
        JSON.stringify(tags || []),
        category || null,
        userId
      ]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create whitepaper error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update whitepaper (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { title, abstract, content, author, citations, resources, tags, category } = req.body

    const result = await pool.query(
      `UPDATE whitepapers 
       SET title = $1, abstract = $2, content = $3, author = $4, 
           citations = $5, resources = $6, tags = $7, category = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING *`,
      [
        title,
        abstract || null,
        content,
        author || null,
        JSON.stringify(citations || []),
        JSON.stringify(resources || []),
        JSON.stringify(tags || []),
        category || null,
        id
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Whitepaper not found' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('Update whitepaper error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete whitepaper (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM whitepapers WHERE id = $1', [id])

    res.json({ message: 'Whitepaper deleted successfully' })
  } catch (error) {
    console.error('Delete whitepaper error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

