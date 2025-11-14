import React, { useState, useEffect } from 'react'
import { researchProposalsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import './ResearchProposalsPage.css'

const ResearchProposalsPage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [proposals, setProposals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    budgetAmount: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadProposals()
  }, [])

  const loadProposals = async () => {
    try {
      setLoading(true)
      const data = await researchProposalsAPI.getAll(true)
      setProposals(data)
    } catch (error) {
      console.error('Failed to load proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (proposalId) => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    try {
      await researchProposalsAPI.vote(proposalId)
      await loadProposals()
    } catch (error) {
      console.error('Failed to vote:', error)
      alert(error.message || 'Failed to vote')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    
    if (!newProposal.title.trim()) {
      alert('Please enter a title')
      return
    }

    try {
      setCreating(true)
      await researchProposalsAPI.create(newProposal)
      setNewProposal({ title: '', description: '', budgetAmount: '' })
      setShowCreateForm(false)
      await loadProposals()
    } catch (error) {
      console.error('Failed to create proposal:', error)
      alert(error.message || 'Failed to create proposal')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="research-proposals-page">
      <div className="page-header">
        <h1>Research Proposals</h1>
        <p>If you had $1 million, which research would you fund?</p>
        {user && (
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-create"
          >
            {showCreateForm ? 'Cancel' : '+ Create Proposal'}
          </button>
        )}
      </div>

      {showCreateForm && user && (
        <form onSubmit={handleCreate} className="create-proposal-form">
          <h2>Create Research Proposal</h2>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={newProposal.title}
              onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={newProposal.description}
              onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Budget Amount</label>
            <input
              type="number"
              value={newProposal.budgetAmount}
              onChange={(e) => setNewProposal({ ...newProposal, budgetAmount: e.target.value })}
              placeholder="e.g., 1000000"
            />
          </div>
          <button type="submit" disabled={creating} className="btn-submit">
            {creating ? 'Creating...' : 'Create Proposal'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="loading">Loading proposals...</div>
      ) : (
        <div className="proposals-grid">
          {proposals.map((proposal) => (
            <div key={proposal.id} className="proposal-card">
              <h3>{proposal.title}</h3>
              {proposal.description && (
                <p className="proposal-description">{proposal.description}</p>
              )}
              {proposal.budget_amount && (
                <div className="budget">
                  Budget: ${parseFloat(proposal.budget_amount).toLocaleString()}
                </div>
              )}
              <div className="proposal-footer">
                <div className="vote-count">
                  {proposal.vote_count || 0} votes
                </div>
                {user && (
                  <button
                    onClick={() => handleVote(proposal.id)}
                    className="btn-vote"
                  >
                    Vote
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && proposals.length === 0 && (
        <div className="no-proposals">
          No research proposals yet. Be the first to create one!
        </div>
      )}
    </div>
  )
}

export default ResearchProposalsPage

