import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { requireAuth, requireAdmin } from '../middleware/permissions.js'

const router = express.Router()

// Vote yes/no on a proposition (topic, survey question, etc.)
router.post('/proposition/:id/vote', authenticateToken, requireAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { voteValue, propositionType = 'topic' } = req.body
    const userId = req.user.userId

    if (!['agree', 'disagree', 'neutral'].includes(voteValue)) {
      return res.status(400).json({ error: 'Vote value must be "agree", "disagree", or "neutral"' })
    }

    // Get user's group
    const userResult = await pool.query('SELECT user_group FROM users WHERE id = $1', [userId])
    const userGroup = userResult.rows[0]?.user_group || 'user'

    // Check if user already voted
    const existingVote = await pool.query(
      `SELECT id, vote_value FROM proposition_votes 
       WHERE proposition_id = $1 AND proposition_type = $2 AND user_id = $3`,
      [id, propositionType, userId]
    )

    if (existingVote.rows.length > 0) {
      // Update existing vote if different
      if (existingVote.rows[0].vote_value !== voteValue) {
        await pool.query(
          `UPDATE proposition_votes 
           SET vote_value = $1, updated_at = NOW() 
           WHERE id = $2`,
          [voteValue, existingVote.rows[0].id]
        )
      } else {
        // Remove vote if same value clicked
        await pool.query(
          'DELETE FROM proposition_votes WHERE id = $1',
          [existingVote.rows[0].id]
        )
        return res.json({ message: 'Vote removed', voted: false, voteValue: null })
      }
    } else {
      // Create new vote
      await pool.query(
        `INSERT INTO proposition_votes (proposition_id, proposition_type, user_id, vote_value, user_group)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, propositionType, userId, voteValue, userGroup]
      )
    }

    // Get updated vote statistics
    const stats = await getVoteStatistics(id, propositionType)

    res.json({ 
      message: 'Vote recorded', 
      voted: true, 
      voteValue,
      statistics: stats
    })
  } catch (error) {
    console.error('Vote error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get vote statistics for a proposition
router.get('/proposition/:id/statistics', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params
    const { propositionType = 'topic' } = req.query

    const stats = await getVoteStatistics(id, propositionType)
    res.json(stats)
  } catch (error) {
    console.error('Get statistics error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Helper function to get vote statistics
async function getVoteStatistics(propositionId, propositionType) {
  // Overall statistics
  const overall = await pool.query(
    `SELECT 
       vote_value,
       COUNT(*) as count
     FROM proposition_votes
     WHERE proposition_id = $1 AND proposition_type = $2
     GROUP BY vote_value`,
    [propositionId, propositionType]
  )

  const agreeCount = overall.rows.find(r => r.vote_value === 'agree')?.count || 0
  const disagreeCount = overall.rows.find(r => r.vote_value === 'disagree')?.count || 0
  const neutralCount = overall.rows.find(r => r.vote_value === 'neutral')?.count || 0
  const total = parseInt(agreeCount) + parseInt(disagreeCount) + parseInt(neutralCount)
  const agreePercent = total > 0 ? Math.round((agreeCount / total) * 100) : 0
  const disagreePercent = total > 0 ? Math.round((disagreeCount / total) * 100) : 0
  const neutralPercent = total > 0 ? Math.round((neutralCount / total) * 100) : 0

  // Group-based statistics
  const groupStats = await pool.query(
    `SELECT 
       user_group,
       vote_value,
       COUNT(*) as count
     FROM proposition_votes
     WHERE proposition_id = $1 AND proposition_type = $2
     GROUP BY user_group, vote_value
     ORDER BY user_group, vote_value`,
    [propositionId, propositionType]
  )

  // Organize group statistics
  const groups = {}
  groupStats.rows.forEach(row => {
    if (!groups[row.user_group]) {
      groups[row.user_group] = { agree: 0, disagree: 0, neutral: 0, total: 0 }
    }
    groups[row.user_group][row.vote_value] = parseInt(row.count)
    groups[row.user_group].total += parseInt(row.count)
  })

  // Calculate percentages for each group
  const groupPercentages = {}
  Object.keys(groups).forEach(group => {
    const g = groups[group]
    groupPercentages[group] = {
      agree: g.total > 0 ? Math.round((g.agree / g.total) * 100) : 0,
      disagree: g.total > 0 ? Math.round((g.disagree / g.total) * 100) : 0,
      neutral: g.total > 0 ? Math.round((g.neutral / g.total) * 100) : 0,
      total: g.total
    }
  })

  return {
    overall: {
      agree: parseInt(agreeCount),
      disagree: parseInt(disagreeCount),
      neutral: parseInt(neutralCount),
      total,
      agreePercent,
      disagreePercent,
      neutralPercent
    },
    byGroup: groupPercentages
  }
}

// Get filtered voting data (for filters page)
router.get('/filtered', optionalAuth, async (req, res) => {
  try {
    const { 
      filter = 'all', // 'highest_agreement', 'biggest_difference', 'most_controversial', 'all'
      propositionType = 'topic',
      minVotes = 0
    } = req.query

    let query = `
      SELECT 
        pv.proposition_id,
        pv.proposition_type,
        COUNT(*) as total_votes,
        SUM(CASE WHEN pv.vote_value = 'agree' THEN 1 ELSE 0 END) as agree_votes,
        SUM(CASE WHEN pv.vote_value = 'disagree' THEN 1 ELSE 0 END) as disagree_votes,
        SUM(CASE WHEN pv.vote_value = 'neutral' THEN 1 ELSE 0 END) as neutral_votes
      FROM proposition_votes pv
      WHERE pv.proposition_type = $1
      GROUP BY pv.proposition_id, pv.proposition_type
      HAVING COUNT(*) >= $2
    `
    const params = [propositionType, parseInt(minVotes) || 0]

    // Add filter-specific ordering
    switch (filter) {
      case 'highest_agreement':
        query += `
          ORDER BY 
            GREATEST(
              SUM(CASE WHEN pv.vote_value = 'agree' THEN 1 ELSE 0 END),
              SUM(CASE WHEN pv.vote_value = 'disagree' THEN 1 ELSE 0 END),
              SUM(CASE WHEN pv.vote_value = 'neutral' THEN 1 ELSE 0 END)
            )::float / NULLIF(COUNT(*), 0) DESC,
            COUNT(*) DESC
        `
        break
      case 'biggest_difference':
        query = `
          SELECT 
            pv.proposition_id,
            pv.proposition_type,
            COUNT(*) as total_votes,
            SUM(CASE WHEN pv.vote_value = 'agree' THEN 1 ELSE 0 END) as agree_votes,
            SUM(CASE WHEN pv.vote_value = 'disagree' THEN 1 ELSE 0 END) as disagree_votes,
            SUM(CASE WHEN pv.vote_value = 'neutral' THEN 1 ELSE 0 END) as neutral_votes,
            ABS(
              SUM(CASE WHEN pv.vote_value = 'agree' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0) -
              SUM(CASE WHEN pv.user_group = 'teacher' AND pv.vote_value = 'agree' THEN 1 ELSE 0 END)::float / NULLIF(SUM(CASE WHEN pv.user_group = 'teacher' THEN 1 ELSE 0 END), 0)
            ) as difference
          FROM proposition_votes pv
          WHERE pv.proposition_type = $1
          GROUP BY pv.proposition_id, pv.proposition_type
          HAVING COUNT(*) >= $2
          ORDER BY difference DESC, COUNT(*) DESC
        `
        break
      case 'most_controversial':
        query += `
          ORDER BY 
            ABS(
              SUM(CASE WHEN pv.vote_value = 'agree' THEN 1 ELSE 0 END)::float / NULLIF(COUNT(*), 0) - 0.5
            ) ASC,
            COUNT(*) DESC
        `
        break
      default:
        query += ' ORDER BY COUNT(*) DESC'
    }

    const result = await pool.query(query, params)

    // Get detailed statistics for each proposition
    const propositions = await Promise.all(
      result.rows.map(async (row) => {
        const stats = await getVoteStatistics(row.proposition_id, row.proposition_type)
        return {
          propositionId: row.proposition_id,
          propositionType: row.proposition_type,
          ...stats
        }
      })
    )

    res.json(propositions)
  } catch (error) {
    console.error('Get filtered votes error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

