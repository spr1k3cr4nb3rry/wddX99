import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../../common/SectionTitle/SectionTitle'
import TopicCard from '../../common/TopicCard/TopicCard'
import { topicsAPI } from '../../../services/api'
import './TrendingTopics.css'

function TrendingTopics() {
  const navigate = useNavigate()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTrendingTopics()
  }, [])

  const loadTrendingTopics = async () => {
    try {
      setLoading(true)
      // Fetch trending topics from API
      const data = await topicsAPI.getAll({ sortBy: 'trending' })
      // Take top 5 trending topics and transform to match TopicCard format
      const trendingTopics = data.slice(0, 5).map((topic, index) => ({
        ...topic,
        id: topic.id,
        title: topic.title,
        description: topic.description || '',
        abstract: topic.abstract || '', // Explicitly pass abstract
        featured: index === 0, // First topic is featured
        image: topic.image || '/images/placeholder.svg',
        author: topic.user_name ? {
          name: topic.user_name,
          avatar: '/images/placeholder.svg',
          title: topic.author_title || topic.author?.title || ''
        } : undefined,
        category: topic.category,
        tags: Array.isArray(topic.tags) ? topic.tags : [],
        votes: topic.votes || 0,
        comments: topic.comment_count || topic.comments || 0,
        views: topic.views || 0,
        readTime: topic.read_time || 5,
        createdAt: topic.created_at || topic.createdAt,
        status: topic.status,
        content: topic.content || { sections: [], references: [] }
      }))
      setTopics(trendingTopics)
    } catch (error) {
      console.error('Failed to load trending topics:', error)
      // Fallback to empty array if API fails
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  const handleTopicClick = (topic) => {
    navigate(`/topic/${topic.id}`)
  }

  if (loading) {
    return (
      <section className="trending-topics">
        <div className="topics-container">
          <SectionTitle>Trending Topics</SectionTitle>
          <div className="loading-message">Loading trending topics...</div>
        </div>
      </section>
    )
  }

  if (topics.length === 0) {
    return null
  }

  return (
    <section className="trending-topics">
      <div className="topics-container">
        <SectionTitle>Trending Topics</SectionTitle>
        <div className="topics-grid">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              topic={topic}
              featured={topic.featured}
              onClick={() => handleTopicClick(topic)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TrendingTopics

