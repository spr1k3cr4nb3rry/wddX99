import React, { useState, useEffect } from 'react'
import { votingAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import './YesNoVote.css'

const YesNoVote = ({ propositionId, propositionType = 'topic', onVoteChange }) => {
  const { user } = useAuth()
  const [statistics, setStatistics] = useState(null)
  const [userVote, setUserVote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('all')

  useEffect(() => {
    loadStatistics()
  }, [propositionId, propositionType])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const stats = await votingAPI.getStatistics(propositionId, propositionType)
      setStatistics(stats)
      
      // Check user's vote (would need to be added to API response)
      // For now, we'll track it locally
    } catch (error) {
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (voteValue) => {
    if (!user) {
      alert('Please login to vote')
      return
    }

    try {
      setVoting(true)
      const response = await votingAPI.voteOnProposition(propositionId, voteValue, propositionType)
      
      if (response.voted) {
        setUserVote(response.voteValue)
      } else {
        setUserVote(null)
      }
      
      // Reload statistics
      await loadStatistics()
      
      if (onVoteChange) {
        onVoteChange(response)
      }
    } catch (error) {
      console.error('Failed to vote:', error)
      alert(error.message || 'Failed to vote')
    } finally {
      setVoting(false)
    }
  }

  if (loading) {
    return <div className="yes-no-vote loading">Loading...</div>
  }

  if (!statistics) {
    return <div className="yes-no-vote">No statistics available</div>
  }

  const { overall, byGroup } = statistics
  
  // Get stats based on selected group filter
  const getDisplayStats = () => {
    if (selectedGroup === 'all' || !byGroup[selectedGroup]) {
      return overall
    }
    const groupStats = byGroup[selectedGroup]
    const total = groupStats.total
    return {
      agree: groupStats.agree,
      disagree: groupStats.disagree,
      neutral: groupStats.neutral,
      total,
      agreePercent: groupStats.agree,
      disagreePercent: groupStats.disagree,
      neutralPercent: groupStats.neutral
    }
  }

  const displayStats = getDisplayStats()
  const agreePercent = displayStats.agreePercent || 0
  const disagreePercent = displayStats.disagreePercent || 0
  const neutralPercent = displayStats.neutralPercent || 0
  const total = displayStats.total

  // Get available groups for filter
  const availableGroups = [
    { value: 'all', label: 'All Users' },
    { value: 'user', label: 'General' },
    { value: 'teacher', label: 'Teachers' },
    { value: 'expert', label: 'Experts' },
    { value: 'educator', label: 'Educators' },
    { value: 'admin', label: 'Admins' }
  ].filter(group => group.value === 'all' || byGroup[group.value])

  return (
    <div className="yes-no-vote">
      <div className="vote-context">
        <h3 className="vote-title">Community Consensus</h3>
        <p className="vote-description">
          Share your perspective on this topic. Your vote helps us understand the community's views and identify areas of agreement or disagreement.
        </p>
      </div>
      
      <div className="vote-header">
        <div className="vote-buttons">
          <button
            className={`vote-btn agree-btn ${userVote === 'agree' ? 'active' : ''}`}
            onClick={() => handleVote('agree')}
            disabled={voting || !user}
          >
            Agree
          </button>
          <button
            className={`vote-btn neutral-btn ${userVote === 'neutral' ? 'active' : ''}`}
            onClick={() => handleVote('neutral')}
            disabled={voting || !user}
          >
            Neutral
          </button>
          <button
            className={`vote-btn disagree-btn ${userVote === 'disagree' ? 'active' : ''}`}
            onClick={() => handleVote('disagree')}
            disabled={voting || !user}
          >
            Disagree
          </button>
        </div>
        
        {availableGroups.length > 1 && (
          <select 
            className="group-filter"
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            {availableGroups.map(group => (
              <option key={group.value} value={group.value}>{group.label}</option>
            ))}
          </select>
        )}
      </div>

      {total > 0 && (
        <div className="vote-stats-compact">
          <div className="vote-chart-compact">
            <div className="chart-bar-compact">
              <div 
                className="chart-segment agree-segment" 
                style={{ width: `${agreePercent}%` }}
              />
              <div 
                className="chart-segment neutral-segment" 
                style={{ width: `${neutralPercent}%` }}
              />
              <div 
                className="chart-segment disagree-segment" 
                style={{ width: `${disagreePercent}%` }}
              />
            </div>
          </div>
          <div className="vote-stats-text">
            <span className="stat-item">Agree: {agreePercent}%</span>
            <span className="stat-item">Neutral: {neutralPercent}%</span>
            <span className="stat-item">Disagree: {disagreePercent}%</span>
            <span className="stat-item">{total} votes</span>
          </div>
        </div>
      )}

      {total === 0 && (
        <div className="no-votes">No votes yet</div>
      )}
    </div>
  )
}

export default YesNoVote

