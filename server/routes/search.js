import express from 'express'
import pool from '../config/database.js'
import { optionalAuth } from '../middleware/auth.js'

const router = express.Router()

// Get search suggestions/autocomplete
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.length < 2) {
      return res.json([])
    }

    const isAdmin = req.user?.role === 'admin'
    const searchTerm = `%${q}%`

    // Get topic title suggestions
    const topicsQuery = `SELECT DISTINCT title 
                         FROM topics 
                         WHERE (approved = true OR $1 = true)
                         AND title ILIKE $2
                         ORDER BY title
                         LIMIT 5`
    
    // Get tag suggestions
    const tagsQuery = `SELECT DISTINCT tag
                       FROM (
                         SELECT unnest(tags::text[]) as tag
                         FROM topics
                         WHERE (approved = true OR $1 = true)
                       ) sub
                       WHERE tag ILIKE $2
                       ORDER BY tag
                       LIMIT 5`

    // Get category suggestions
    const categoriesQuery = `SELECT DISTINCT category
                             FROM topics
                             WHERE (approved = true OR $1 = true)
                             AND category ILIKE $2
                             ORDER BY category
                             LIMIT 5`

    const [topicsResult, tagsResult, categoriesResult] = await Promise.all([
      pool.query(topicsQuery, [isAdmin, searchTerm]),
      pool.query(tagsQuery, [isAdmin, searchTerm]),
      pool.query(categoriesQuery, [isAdmin, searchTerm])
    ])

    const suggestions = {
      topics: topicsResult.rows.map(r => r.title),
      tags: tagsResult.rows.map(r => r.tag?.replace(/"/g, '') || r.tag),
      categories: categoriesResult.rows.map(r => r.category)
    }

    res.json(suggestions)
  } catch (error) {
    console.error('Search suggestions error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get popular searches
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    // This could be enhanced with a search_logs table in the future
    // For now, return popular tags
    const result = await pool.query(
      `SELECT tag, COUNT(*) as count
       FROM (
         SELECT unnest(tags::text[]) as tag
         FROM topics
         WHERE approved = true
       ) sub
       GROUP BY tag
       ORDER BY count DESC
       LIMIT 10`
    )

    res.json(result.rows.map(r => ({
      term: r.tag?.replace(/"/g, '') || r.tag,
      count: parseInt(r.count)
    })))
  } catch (error) {
    console.error('Popular searches error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router


