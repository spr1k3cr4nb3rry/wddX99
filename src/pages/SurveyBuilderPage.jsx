import React, { useState, useEffect } from 'react'
import { surveysAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './SurveyBuilderPage.css'

const SurveyBuilderPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState([
    { questionText: '', questionType: 'yes_no', options: [], orderIndex: 0 }
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/')
    }
  }, [user, navigate])

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { 
        questionText: '', 
        questionType: 'yes_no', 
        options: [], 
        orderIndex: questions.length 
      }
    ])
  }

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index).map((q, i) => ({ ...q, orderIndex: i })))
  }

  const updateQuestion = (index, field, value) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!title.trim()) {
      alert('Please enter a survey title')
      return
    }

    if (questions.some(q => !q.questionText.trim())) {
      alert('Please fill in all questions')
      return
    }

    try {
      setSaving(true)
      await surveysAPI.create({
        title,
        description,
        questions: questions.map((q, i) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options,
          orderIndex: i
        }))
      })
      alert('Survey created successfully!')
      navigate('/surveys')
    } catch (error) {
      console.error('Failed to create survey:', error)
      alert(error.message || 'Failed to create survey')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="survey-builder-page">
      <div className="page-header">
        <h1>Create Survey</h1>
        <p>Build a custom survey for research</p>
      </div>

      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-section">
          <label>
            Survey Title *
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter survey title"
              required
            />
          </label>
        </div>

        <div className="form-section">
          <label>
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter survey description"
              rows="3"
            />
          </label>
        </div>

        <div className="questions-section">
          <div className="section-header">
            <h2>Questions</h2>
            <button type="button" onClick={addQuestion} className="btn-add">
              + Add Question
            </button>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="question-card">
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="question-fields">
                <label>
                  Question Text *
                  <input
                    type="text"
                    value={question.questionText}
                    onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                    placeholder="Enter your question"
                    required
                  />
                </label>

                <label>
                  Question Type
                  <select
                    value={question.questionType}
                    onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                  >
                    <option value="yes_no">Yes/No</option>
                    <option value="multiple_choice">Multiple Choice</option>
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate('/surveys')} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-submit">
            {saving ? 'Creating...' : 'Create Survey'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SurveyBuilderPage

