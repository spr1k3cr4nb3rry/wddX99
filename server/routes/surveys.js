import express from 'express'
import pool from '../config/database.js'
import { authenticateToken, optionalAuth } from '../middleware/auth.js'
import { requireAuth, requireAdmin } from '../middleware/permissions.js'

const router = express.Router()

// Get all surveys
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { isActive } = req.query
    let query = `
      SELECT s.*, u.name as creator_name,
             COUNT(DISTINCT sq.id) as question_count
      FROM surveys s
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN survey_questions sq ON s.id = sq.survey_id
    `
    const params = []

    if (isActive !== undefined) {
      query += ` WHERE s.is_active = $1`
      params.push(isActive === 'true')
    }

    query += ` GROUP BY s.id, u.name ORDER BY s.created_at DESC`

    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (error) {
    console.error('Get surveys error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single survey with questions
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const surveyResult = await pool.query(
      `SELECT s.*, u.name as creator_name 
       FROM surveys s
       LEFT JOIN users u ON s.created_by = u.id
       WHERE s.id = $1`,
      [id]
    )

    if (surveyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Survey not found' })
    }

    const questionsResult = await pool.query(
      `SELECT * FROM survey_questions 
       WHERE survey_id = $1 
       ORDER BY order_index ASC, created_at ASC`,
      [id]
    )

    res.json({
      ...surveyResult.rows[0],
      questions: questionsResult.rows
    })
  } catch (error) {
    console.error('Get survey error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create survey (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, settings, questions } = req.body
    const userId = req.user.userId

    // Create survey
    const surveyResult = await pool.query(
      `INSERT INTO surveys (title, description, created_by, settings)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [title, description, userId, JSON.stringify(settings || {})]
    )

    const survey = surveyResult.rows[0]

    // Create questions if provided
    if (questions && Array.isArray(questions)) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await pool.query(
          `INSERT INTO survey_questions (survey_id, question_text, question_type, options, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            survey.id,
            q.questionText,
            q.questionType || 'yes_no',
            JSON.stringify(q.options || []),
            q.orderIndex !== undefined ? q.orderIndex : i
          ]
        )
      }
    }

    // Fetch complete survey with questions
    const questionsResult = await pool.query(
      `SELECT * FROM survey_questions 
       WHERE survey_id = $1 
       ORDER BY order_index ASC`,
      [survey.id]
    )

    res.status(201).json({
      ...survey,
      questions: questionsResult.rows
    })
  } catch (error) {
    console.error('Create survey error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update survey (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, settings, isActive, questions } = req.body

    const updateFields = []
    const params = []
    let paramCount = 1

    if (title !== undefined) {
      updateFields.push(`title = $${paramCount++}`)
      params.push(title)
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`)
      params.push(description)
    }
    if (settings !== undefined) {
      updateFields.push(`settings = $${paramCount++}`)
      params.push(JSON.stringify(settings))
    }
    if (isActive !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`)
      params.push(isActive)
    }

    if (updateFields.length > 0) {
      updateFields.push(`updated_at = NOW()`)
      params.push(id)

      await pool.query(
        `UPDATE surveys SET ${updateFields.join(', ')} WHERE id = $${paramCount}`,
        params
      )
    }

    // Update questions if provided
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await pool.query('DELETE FROM survey_questions WHERE survey_id = $1', [id])

      // Insert new questions
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i]
        await pool.query(
          `INSERT INTO survey_questions (survey_id, question_text, question_type, options, order_index)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            id,
            q.questionText,
            q.questionType || 'yes_no',
            JSON.stringify(q.options || []),
            q.orderIndex !== undefined ? q.orderIndex : i
          ]
        )
      }
    }

    // Fetch updated survey
    const surveyResult = await pool.query('SELECT * FROM surveys WHERE id = $1', [id])
    const questionsResult = await pool.query(
      `SELECT * FROM survey_questions 
       WHERE survey_id = $1 
       ORDER BY order_index ASC`,
      [id]
    )

    res.json({
      ...surveyResult.rows[0],
      questions: questionsResult.rows
    })
  } catch (error) {
    console.error('Update survey error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete survey (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params

    await pool.query('DELETE FROM surveys WHERE id = $1', [id])

    res.json({ message: 'Survey deleted successfully' })
  } catch (error) {
    console.error('Delete survey error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

