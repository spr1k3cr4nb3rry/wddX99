import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { requireAuth } from '../middleware/permissions.js'

const router = express.Router()

// Get all research proposals
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { isActive } = req.query
    let query = `
      SELECT rp.*, u.name as creator_name,
             COUNT(DISTINCT rpv.id) as vote_count
      FROM research_proposals rp
      LEFT JOIN users u ON rp.created_by = u.id
      LEFT JOIN research_proposal_votes rpv ON rp.id = rpv.proposal_id
    `
    const params = []

    if (isActive !== undefined) {
      query += ` WHERE rp.is_active = $1`
      params.push(isActive === 'true')
    }

    query += ` GROUP BY rp.id, u.name ORDER BY vote_count DESC, rp.created_at DESC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get research proposals error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single research proposal with vote statistics
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const proposalResult = await pool.query(
      `SELECT rp.*, u.name as creator_name 
       FROM research_proposals rp
       LEFT JOIN users u ON rp.created_by = u.id
       WHERE rp.id = $1`,
      [id]
    )

    if (proposalResult.rows.length === 0) {
      return res.status(404).json({ error: 'Research proposal not found' })
    }

    // Get vote statistics by group
    const voteStats = await pool.query(
      `SELECT 
         user_group,
         COUNT(*) as vote_count
       FROM research_proposal_votes
       WHERE proposal_id = $1
       GROUP BY user_group`,
      [id]
    )

    const totalVotes = await pool.query(
      `SELECT COUNT(*) as total FROM research_proposal_votes WHERE proposal_id = $1`,
      [id]
    )

    res.json({
      ...proposalResult.rows[0],
      voteStatistics: {
        total: parseInt(totalVotes.rows[0].total),
        byGroup: voteStats.rows.reduce((acc, row) => {
          acc[row.user_group] = parseInt(row.vote_count)
          return acc
        }, {})
      }
    })
  } catch (error) {
    console.error('Get research proposal error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create research proposal (authenticated users)
router.post('/', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { title, description, budgetAmount } = req.body
    const userId = req.user.userId

    const result = await pool.query(
      `INSERT INTO research_proposals (title, description, budget_amount, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, budgetAmount || null, userId]
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('Create research proposal error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Vote on research proposal (which one would you fund with $1M)
router.post('/:id/vote', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    // Get user's group
    const userResult = await pool.query('SELECT user_group FROM users WHERE id = $1', [userId])
    const userGroup = userResult.rows[0]?.user_group || 'user'

    // Check if user already voted
    const existingVote = await pool.query(
      'SELECT id FROM research_proposal_votes WHERE proposal_id = $1 AND user_id = $2',
      [id, userId]
    )

    if (existingVote.rows.length > 0) {
      // Remove vote
      await pool.query(
        'DELETE FROM research_proposal_votes WHERE id = $1',
        [existingVote.rows[0].id]
      )
      return res.json({ message: 'Vote removed', voted: false })
    } else {
      // Add vote
      await pool.query(
        `INSERT INTO research_proposal_votes (proposal_id, user_id, user_group)
         VALUES ($1, $2, $3)`,
        [id, userId, userGroup]
      )
      return res.json({ message: 'Vote added', voted: true })
    }
  } catch (error) {
    console.error('Vote on research proposal error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

