import React from 'react'
import { useNavigate } from 'react-router-dom'
import TopicCard from '../../common/TopicCard/TopicCard'
import TopicListItem from '../TopicListItem/TopicListItem'
import './TopicList.css'

function TopicList({ topics, viewMode, filters }) {
  const navigate = useNavigate()
  
  // Filter and sort topics based on filters
  const filteredAndSortedTopics = React.useMemo(() => {
    let result = [...topics]

    // Filter by search
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(topic =>
        topic.title.toLowerCase().includes(searchLower) ||
        topic.description?.toLowerCase().includes(searchLower) ||
        (topic.tags && topic.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      )
    }

    // Filter by category
    if (filters.category) {
      result = result.filter(topic => topic.category === filters.category)
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        break
      case 'popular':
        result.sort((a, b) => b.views - a.views)
        break
      case 'most-voted':
        result.sort((a, b) => b.votes - a.votes)
        break
      case 'trending':
        result.sort((a, b) => (b.votes + b.comments) - (a.votes + a.comments))
        break
      case 'alphabetical':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      default:
        break
    }

    return result
  }, [topics, filters])

  const handleTopicClick = (topic) => {
    navigate(`/topic/${topic.id}`)
  }

  if (filteredAndSortedTopics.length === 0) {
    return (
      <div className="no-topics">
        <p>No topics found matching your filters.</p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="topic-list-view">
        {filteredAndSortedTopics.map((topic) => (
          <TopicListItem
            key={topic.id}
            topic={topic}
            onClick={() => handleTopicClick(topic)}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="topic-grid-view">
      {filteredAndSortedTopics.map((topic) => (
        <TopicCard
          key={topic.id}
          topic={topic}
          featured={false}
          onClick={() => handleTopicClick(topic)}
        />
      ))}
    </div>
  )
}

export default TopicList

