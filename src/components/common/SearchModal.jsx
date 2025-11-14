import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal/Modal'
import './SearchModal.css'

function SearchModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/topics?search=${encodeURIComponent(searchQuery.trim())}`)
      onClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Search Topics">
      <form onSubmit={handleSubmit} className="search-modal-form">
        <div className="search-input-wrapper">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for topics, authors, or keywords..."
            className="search-modal-input"
            autoFocus
          />
          <button type="submit" className="search-submit-btn" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
        <p className="search-hint">Press Enter to search or navigate to the Topics page</p>
      </form>
    </Modal>
  )
}

export default SearchModal

