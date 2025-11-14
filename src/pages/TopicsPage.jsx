import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import TopicFilters from '../components/topics/TopicFilters/TopicFilters'
import TopicList from '../components/topics/TopicList/TopicList'
import CardSkeleton from '../components/common/CardSkeleton/CardSkeleton'
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { topicsAPI } from '../services/api'
import './TopicsPage.css'

function TopicsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sortBy: 'newest',
    viewMode: 'grid',
    author: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    tags: '',
    minVotes: '',
    minViews: ''
  })
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load topics from API
  useEffect(() => {
    loadTopics()
  }, [filters, user])

  useEffect(() => {
    // Read search query from URL
    const searchQuery = searchParams.get('search')
    if (searchQuery) {
      setFilters(prev => ({ ...prev, search: searchQuery }))
    }
  }, [searchParams])

  const loadTopics = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await topicsAPI.getAll(filters)
      setTopics(data)
    } catch (err) {
      setError('Failed to load topics')
      console.error('Error loading topics:', err)
      // Fallback to empty array
      setTopics([])
    } finally {
      setLoading(false)
    }
  }

  // Mock data fallback (removed - now using API)
  const mockTopics = [
    {
      id: 1,
      title: 'Ai in Education',
      description: 'How will emerging technologies, shifting workforce demands, and evolving social dynamics transform the landscape of education?',
      author: {
        name: 'Dr. Sarah Johnson',
        avatar: '/images/placeholder.svg'
      },
      category: 'Technology',
      tags: ['AI', 'Innovation', 'Future'],
      votes: 42,
      comments: 15,
      views: 128,
      readTime: 5,
      status: 'Trending',
      createdAt: '2024-01-15',
      image: '/images/ai.jpg'
    },
    {
      id: 2,
      title: 'The Shift from Degrees to Skills',
      description: 'Exploring how the modern workforce is prioritizing practical skills and competencies over traditional academic credentials.',
      author: {
        name: 'Marcus T. Holloway',
        avatar: '/images/placeholder.svg'
      },
      category: 'Career Development',
      tags: ['Skills', 'Education', 'Career'],
      votes: 38,
      comments: 12,
      views: 95,
      readTime: 4,
      status: 'Active',
      createdAt: '2024-01-12',
      image: '/images/skill1.jpg'
    },
    {
      id: 3,
      title: 'The Value of a College Degree in 2025',
      description: 'Analyzing the evolving worth of higher education degrees and their impact on career trajectories in the current economic landscape.',
      author: {
        name: 'Elena M. Calder',
        avatar: '/images/placeholder.svg'
      },
      category: 'Education',
      tags: ['Degree', 'Value', '2025'],
      votes: 35,
      comments: 20,
      views: 156,
      readTime: 6,
      status: 'Popular',
      createdAt: '2024-01-10',
      image: '/images/degree.jpg'
    },
    {
      id: 4,
      title: 'Micro-Credentials: The Future of Fast Learning',
      description: 'Investigating how bite-sized learning credentials are reshaping professional development and continuous education pathways.',
      author: {
        name: 'Dr. James Wilson',
        avatar: '/images/placeholder.svg'
      },
      category: 'Learning',
      tags: ['Credentials', 'Fast Learning', 'Future'],
      votes: 28,
      comments: 8,
      views: 87,
      readTime: 3,
      status: 'Active',
      createdAt: '2024-01-08',
      image: '/images/fastlearning.jpg'
    },
    {
      id: 5,
      title: 'Lifelong Learning as a Career Strategy',
      description: 'Examining how continuous learning and skill adaptation have become essential components of successful long-term career planning.',
      author: {
        name: 'Dr. Maria Garcia',
        avatar: '/images/placeholder.svg'
      },
      category: 'Career Development',
      tags: ['Lifelong Learning', 'Strategy', 'Career'],
      votes: 45,
      comments: 18,
      views: 142,
      readTime: 7,
      status: 'Trending',
      createdAt: '2024-01-05',
      image: '/images/career.jpg'
    },
    {
      id: 6,
      title: 'Online Learning: Accessibility and Equity',
      description: 'Exploring how online education platforms can bridge gaps in educational access and provide equitable learning opportunities for all students.',
      author: {
        name: 'Dr. Robert Chen',
        avatar: '/images/placeholder.svg'
      },
      category: 'Education',
      tags: ['Online Learning', 'Accessibility', 'Equity'],
      votes: 32,
      comments: 14,
      views: 118,
      readTime: 5,
      status: 'Active',
      createdAt: '2024-01-03',
      image: '/images/onlinelearning.jpg'
    },
    {
      id: 7,
      title: 'Project-Based Learning in K-12 Education',
      description: 'Investigating the effectiveness of project-based learning approaches in developing critical thinking and problem-solving skills in students.',
      author: {
        name: 'Dr. Emily Thompson',
        avatar: '/images/placeholder.svg'
      },
      category: 'Learning',
      tags: ['Project-Based', 'K-12', 'Critical Thinking'],
      votes: 29,
      comments: 11,
      views: 103,
      readTime: 4,
      status: 'Active',
      createdAt: '2024-01-01',
      image: '/images/projectlearning.jpg'
    },
    {
      id: 8,
      title: 'The Role of Teachers in Digital Transformation',
      description: 'Understanding how educators are adapting to new technologies and their impact on teaching methodologies and student engagement.',
      author: {
        name: 'Dr. Michael Brown',
        avatar: '/images/placeholder.svg'
      },
      category: 'Technology',
      tags: ['Teachers', 'Digital', 'Transformation'],
      votes: 41,
      comments: 19,
      views: 167,
      readTime: 6,
      status: 'Popular',
      createdAt: '2023-12-28',
      image: '/images/roleofteachers.jpg'
    },
    {
      id: 9,
      title: 'Mental Health Support in Educational Settings',
      description: 'Examining strategies for integrating mental health resources and support systems within schools and universities.',
      author: {
        name: 'Dr. Lisa Anderson',
        avatar: '/images/placeholder.svg'
      },
      category: 'Education',
      tags: ['Mental Health', 'Support', 'Wellbeing'],
      votes: 37,
      comments: 16,
      views: 134,
      readTime: 5,
      status: 'Active',
      createdAt: '2023-12-25',
      image: '/images/pexels-repuding-12064.jpg'
    },
    {
      id: 10,
      title: 'Gamification in Educational Technology',
      description: 'Analyzing how game design elements and mechanics can enhance student motivation and learning outcomes in educational platforms.',
      author: {
        name: 'Dr. David Martinez',
        avatar: '/images/placeholder.svg'
      },
      category: 'Technology',
      tags: ['Gamification', 'EdTech', 'Engagement'],
      votes: 33,
      comments: 13,
      views: 112,
      readTime: 4,
      status: 'Trending',
      createdAt: '2023-12-22',
      image: '/images/gamification.jpg'
    },
    {
      id: 11,
      title: 'Blended Learning Models for Higher Education',
      description: 'Exploring effective combinations of online and in-person instruction to optimize learning experiences in university settings.',
      author: {
        name: 'Dr. Jennifer White',
        avatar: '/images/placeholder.svg'
      },
      category: 'Learning',
      tags: ['Blended Learning', 'Higher Ed', 'Hybrid'],
      votes: 31,
      comments: 9,
      views: 98,
      readTime: 5,
      status: 'Active',
      createdAt: '2023-12-20',
      image: '/images/learningmodels.jpg'
    },
    {
      id: 12,
      title: 'STEM Education and Workforce Preparation',
      description: 'Bridging the gap between STEM curriculum and real-world applications to better prepare students for technical careers.',
      author: {
        name: 'Dr. Kevin Lee',
        avatar: '/images/placeholder.svg'
      },
      category: 'Career Development',
      tags: ['STEM', 'Workforce', 'Preparation'],
      votes: 39,
      comments: 17,
      views: 145,
      readTime: 6,
      status: 'Popular',
      createdAt: '2023-12-18',
      image: '/images/stem.jpg'
    }
  ]

  const categories = ['All', 'Technology', 'Education', 'Career Development', 'Learning', 'Research']

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  const handleCreateTopic = () => {
    if (!user) {
      alert('Please login to create a topic.')
      return
    }
    navigate('/topics/create')
  }

  return (
    <div className="topics-page">
      <Header />
      <main className="topics-main">
        <div className="topics-container">
          <div className="topics-header">
            <h1>All Topics</h1>
            {user && (
              <button className="btn-create-topic" onClick={handleCreateTopic}>
                + Create New Topic
              </button>
            )}
          </div>
          
          <div className="topics-intro">
            <p className="topics-intro-text">
              Explore a comprehensive collection of research topics, propositions, and educational discussions 
              contributed by faculty, researchers, and students. Use the filters below to discover topics by 
              category, sort by relevance, or search for specific subjects. Each topic represents an opportunity 
              for scholarly discourse and collaborative inquiry.
            </p>
          </div>
          
          <TopicFilters
            filters={filters}
            categories={categories}
            onFilterChange={handleFilterChange}
          />
          
          {loading ? (
            <div className="topics-loading">
              {filters.viewMode === 'grid' ? (
                <div className="topic-grid-view">
                  <CardSkeleton count={6} />
                </div>
              ) : (
                <div className="topic-list-view">
                  <CardSkeleton count={5} />
                </div>
              )}
            </div>
          ) : error ? (
            <div className="topics-error">
              <p>{error}</p>
              <button onClick={loadTopics} className="btn-retry">Retry</button>
            </div>
          ) : (
            <TopicList
              topics={topics}
              viewMode={filters.viewMode}
              filters={filters}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TopicsPage

