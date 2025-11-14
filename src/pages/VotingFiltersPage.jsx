import React, { useState, useEffect } from 'react'
import { votingAPI } from '../services/api'
import YesNoVote from '../components/voting/YesNoVote'
import './VotingFiltersPage.css'

const VotingFiltersPage = () => {
  const [filter, setFilter] = useState('all')
  const [propositionType, setPropositionType] = useState('topic')
  const [minVotes, setMinVotes] = useState(0)
  const [propositions, setPropositions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadFilteredPropositions()
  }, [filter, propositionType, minVotes])

  const loadFilteredPropositions = async () => {
    try {
      setLoading(true)
      const data = await votingAPI.getFiltered(filter, propositionType, minVotes)
      setPropositions(data)
    } catch (error) {
      console.error('Failed to load filtered propositions:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOptions = [
    { value: 'all', label: 'All Propositions' },
    { value: 'highest_agreement', label: 'Highest Agreement' },
    { value: 'biggest_difference', label: 'Biggest Difference (Teachers vs Experts)' },
    { value: 'most_controversial', label: 'Most Controversial' },
  ]

  return (
    <div className="voting-filters-page">
      <div className="page-header">
        <h1>Voting Filters & Analysis</h1>
        <p>Explore voting patterns and consensus across different groups</p>
      </div>

      <div className="filters-panel">
        <div className="filter-group">
          <label>Filter Type:</label>
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            {filterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Proposition Type:</label>
          <select 
            value={propositionType} 
            onChange={(e) => setPropositionType(e.target.value)}
            className="filter-select"
          >
            <option value="topic">Topics</option>
            <option value="survey_question">Survey Questions</option>
            <option value="research_proposal">Research Proposals</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Minimum Votes:</label>
          <input
            type="number"
            value={minVotes}
            onChange={(e) => setMinVotes(parseInt(e.target.value) || 0)}
            min="0"
            className="filter-input"
          />
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading propositions...</div>
      ) : (
        <div className="propositions-list">
          {propositions.length === 0 ? (
            <div className="no-results">
              No propositions found matching your filters.
            </div>
          ) : (
            propositions.map((prop, index) => (
              <div key={prop.propositionId || index} className="proposition-card">
                <div className="proposition-header">
                  <h3>Proposition #{prop.propositionId}</h3>
                  <div className="proposition-stats-summary">
                    <span className="stat-item">
                      Total: {prop.overall?.total || 0} votes
                    </span>
                    <span className="stat-item">
                      Yes: {prop.overall?.yesPercent || 0}%
                    </span>
                    <span className="stat-item">
                      No: {prop.overall?.noPercent || 0}%
                    </span>
                  </div>
                </div>
                
                <YesNoVote
                  propositionId={prop.propositionId}
                  propositionType={prop.propositionType || propositionType}
                />
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default VotingFiltersPage

