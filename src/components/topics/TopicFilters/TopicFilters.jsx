import React, { useState, useEffect, useRef } from 'react'
import Button from '../../common/Button/Button'
import { searchAPI } from '../../../services/api'
import './TopicFilters.css'

function TopicFilters({ filters, categories, onFilterChange }) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState({ topics: [], tags: [], categories: [] })
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const searchRef = useRef(null)
  const suggestionsRef = useRef(null)

  // Fetch search suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!filters.search || filters.search.length < 2) {
        setSuggestions({ topics: [], tags: [], categories: [] })
        setShowSuggestions(false)
        return
      }

      setLoadingSuggestions(true)
      try {
        const data = await searchAPI.getSuggestions(filters.search)
        setSuggestions(data)
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
        setShowSuggestions(false)
      } finally {
        setLoadingSuggestions(false)
      }
    }

    const timeoutId = setTimeout(fetchSuggestions, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [filters.search])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchChange = (e) => {
    onFilterChange({ search: e.target.value })
  }

  const handleSuggestionClick = (suggestion, type) => {
    if (type === 'topic') {
      onFilterChange({ search: suggestion })
    } else if (type === 'tag') {
      onFilterChange({ search: suggestion, tags: suggestion })
    } else if (type === 'category') {
      onFilterChange({ category: suggestion })
    }
    setShowSuggestions(false)
  }

  const handleCategoryChange = (e) => {
    onFilterChange({ category: e.target.value })
  }

  const handleSortChange = (e) => {
    onFilterChange({ sortBy: e.target.value })
  }

  const handleViewModeChange = (mode) => {
    onFilterChange({ viewMode: mode })
  }

  return (
    <div className="topic-filters">
      <div className="filters-row">
        <div className="search-container" ref={searchRef}>
          <input
            type="text"
            placeholder="Search topics, tags, authors..."
            className="search-input"
            value={filters.search}
            onChange={handleSearchChange}
            onFocus={() => {
              if (filters.search && filters.search.length >= 2) {
                setShowSuggestions(true)
              }
            }}
          />
          <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          
          {/* Search Suggestions Dropdown */}
          {showSuggestions && (suggestions.topics.length > 0 || suggestions.tags.length > 0 || suggestions.categories.length > 0) && (
            <div className="search-suggestions" ref={suggestionsRef}>
              {loadingSuggestions && (
                <div className="suggestion-loading">Loading suggestions...</div>
              )}
              {suggestions.topics.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-group-title">Topics</div>
                  {suggestions.topics.map((topic, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(topic, 'topic')}
                    >
                      {topic}
                    </div>
                  ))}
                </div>
              )}
              {suggestions.tags.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-group-title">Tags</div>
                  {suggestions.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(tag, 'tag')}
                    >
                      #{tag}
                    </div>
                  ))}
                </div>
              )}
              {suggestions.categories.length > 0 && (
                <div className="suggestion-group">
                  <div className="suggestion-group-title">Categories</div>
                  {suggestions.categories.map((category, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(category, 'category')}
                    >
                      {category}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Category</label>
            <select
              className="filter-select"
              value={filters.category}
              onChange={handleCategoryChange}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All' ? '' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Sort By</label>
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={handleSortChange}
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="trending">Trending</option>
              <option value="most-voted">Most Voted</option>
              <option value="alphabetical">Alphabetical</option>
              {filters.search && <option value="relevance">Relevance</option>}
              <option value="updated">Recently Updated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="view-mode-toggle">
        <button
          className={`view-btn ${filters.viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('grid')}
          aria-label="Grid view"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button
          className={`view-btn ${filters.viewMode === 'list' ? 'active' : ''}`}
          onClick={() => handleViewModeChange('list')}
          aria-label="List view"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default TopicFilters

