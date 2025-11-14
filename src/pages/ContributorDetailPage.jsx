import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import TopicCard from '../components/common/TopicCard/TopicCard'
import { useAuth } from '../context/AuthContext'
import { usersAPI } from '../services/api'
import './ContributorDetailPage.css'

function ContributorDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [contributor, setContributor] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Mock data - will be replaced with API call
  const mockContributors = {
    '1': {
      id: 1,
      name: 'Elena M. Calder',
      title: 'Associate Professor, Department of Education | BYU-Idaho',
      email: 'elena.calder@byui.edu',
      description: 'Dr. Calder explores how technology transforms teaching and learning, working closely with students and local schools to innovate education.',
      image: '/images/womenheadshot.jpg',
      bio: 'Dr. Elena M. Calder is a passionate educator and researcher with over 15 years of experience in educational technology. Her work focuses on integrating innovative technologies into classroom settings to enhance student learning outcomes.',
      background: {
        education: [
          {
            degree: 'Ph.D. in Educational Technology',
            institution: 'Stanford University',
            year: '2008'
          },
          {
            degree: 'M.A. in Curriculum and Instruction',
            institution: 'Brigham Young University',
            year: '2005'
          },
          {
            degree: 'B.S. in Education',
            institution: 'BYU-Idaho',
            year: '2002'
          }
        ],
        specializations: [
          'Educational Technology',
          'Digital Learning Environments',
          'Student Engagement',
          'Pedagogical Innovation'
        ]
      },
      achievements: [
        {
          type: 'Award',
          title: 'Outstanding Educator Award',
          organization: 'BYU-Idaho',
          year: '2023',
          description: 'Recognized for excellence in teaching and innovative use of technology in education'
        },
        {
          type: 'Certificate',
          title: 'Certified Educational Technology Specialist',
          organization: 'ISTE',
          year: '2021',
          description: 'International Society for Technology in Education'
        },
        {
          type: 'Publication',
          title: 'Innovative Teaching Methods in the Digital Age',
          organization: 'Journal of Educational Technology',
          year: '2022',
          description: 'Published research on technology-enhanced learning environments'
        },
        {
          type: 'Award',
          title: 'Best Research Paper',
          organization: 'National Education Conference',
          year: '2020',
          description: 'Awarded for groundbreaking research in educational innovation'
        }
      ],
      topicsCount: 12
    },
    '2': {
      id: 2,
      name: 'Marcus T. Holloway',
      title: 'Professor, Department of Educational Leadership | BYU-Idaho',
      email: 'marcus.holloway@byui.edu',
      description: 'Dr. Holloway studies leadership strategies in K-12 schools, focusing on how principals and administrators can foster inclusive, high-performing learning environments.',
      image: '/images/manheadshot.jpg',
      bio: 'Dr. Marcus T. Holloway is a distinguished professor specializing in educational leadership and administration. With over 20 years of experience in both K-12 and higher education, he has published extensively on leadership best practices.',
      background: {
        education: [
          {
            degree: 'Ph.D. in Educational Leadership',
            institution: 'Harvard University',
            year: '2010'
          },
          {
            degree: 'M.Ed. in School Administration',
            institution: 'Brigham Young University',
            year: '2005'
          },
          {
            degree: 'B.A. in Education',
            institution: 'BYU-Idaho',
            year: '2002'
          }
        ],
        specializations: [
          'Educational Leadership',
          'School Administration',
          'Organizational Development',
          'Inclusive Education'
        ]
      },
      achievements: [
        {
          type: 'Award',
          title: 'Distinguished Professor Award',
          organization: 'BYU-Idaho',
          year: '2024',
          description: 'Recognized for outstanding contributions to educational leadership research'
        },
        {
          type: 'Certificate',
          title: 'Certified School Administrator',
          organization: 'National Association of School Administrators',
          year: '2018',
          description: 'Advanced certification in school leadership'
        },
        {
          type: 'Publication',
          title: 'Leadership Strategies for Modern Schools',
          organization: 'Educational Leadership Journal',
          year: '2023',
          description: 'Comprehensive guide to effective school leadership'
        },
        {
          type: 'Award',
          title: 'Excellence in Research',
          organization: 'Association for Educational Leadership',
          year: '2021',
          description: 'Outstanding research contributions to the field'
        }
      ],
      topicsCount: 10
    }
  }

  // Mock topics data for this contributor
  const mockTopics = {
    '1': [
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
        id: 6,
        title: 'Online Learning: Accessibility and Equity',
        description: 'Exploring how online education platforms can bridge gaps in educational access and provide equitable learning opportunities for all students.',
        author: {
          name: 'Elena M. Calder',
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
        id: 8,
        title: 'The Role of Teachers in Digital Transformation',
        description: 'Understanding how educators are adapting to new technologies and their impact on teaching methodologies and student engagement.',
        author: {
          name: 'Elena M. Calder',
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
      }
    ],
    '2': [
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
        id: 5,
        title: 'Lifelong Learning as a Career Strategy',
        description: 'Examining how continuous learning and skill adaptation have become essential components of successful long-term career planning.',
        author: {
          name: 'Marcus T. Holloway',
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
      }
    ]
  }

  useEffect(() => {
    loadContributor()
  }, [id])

  const loadContributor = async () => {
    setLoading(true)
    setError('')
    try {
      const [contributorData, topicsData] = await Promise.all([
        usersAPI.getById(id),
        usersAPI.getTopics(id)
      ])
      
      setContributor(contributorData)
      setTopics(topicsData)
    } catch (err) {
      setError(err.message || 'Failed to load contributor')
      console.error('Error loading contributor:', err)
      // Fallback to mock data if API fails
      const contributorData = mockContributors[id] || mockContributors['1']
      setContributor(contributorData)
      setTopics(mockTopics[id] || [])
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/')
  }

  const handleTopicClick = (topic) => {
    navigate(`/topic/${topic.id}`)
  }

  if (loading || !contributor) {
    return (
      <div className="contributor-detail-page">
        <Header />
        <main className="contributor-detail-main">
          <div className="contributor-detail-container">
            <p>Loading...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !contributor) {
    return (
      <div className="contributor-detail-page">
        <Header />
        <main className="contributor-detail-main">
          <div className="contributor-detail-container">
            <div className="error-message">{error}</div>
            <button onClick={loadContributor} className="btn-retry">Retry</button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const contributorTopics = topics || []
  const isOwnProfile = user && (user.id === parseInt(id) || user.userId === parseInt(id))

  return (
    <div className="contributor-detail-page">
      <Header />
      <main className="contributor-detail-main">
        <div className="contributor-detail-container">
          <button className="back-button" onClick={handleBack}>
            ← Back to Home
          </button>

          {error && (
            <div className="error-message">{error}</div>
          )}

          {/* Profile Header */}
          <section className="profile-header">
            <div className="profile-image-container">
              <img 
                src={contributor.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(contributor.name)}&background=006EB6&color=fff`} 
                alt={contributor.name} 
                className="profile-image" 
              />
            </div>
            <div className="profile-info">
              <h1 className="profile-name">{contributor.name}</h1>
              {contributor.title && <p className="profile-title">{contributor.title}</p>}
              {contributor.email && <p className="profile-email">{contributor.email}</p>}
              {contributor.location && <p className="profile-location">{contributor.location}</p>}
              {contributor.website && (
                <a href={contributor.website} target="_blank" rel="noopener noreferrer" className="profile-website">
                  {contributor.website}
                </a>
              )}
              {isOwnProfile && (
                <button onClick={() => navigate('/dashboard')} className="btn-edit-profile">
                  Edit Profile
                </button>
              )}
            </div>
          </section>

          {/* Statistics Section */}
          <section className="profile-section">
            <h2 className="section-title">Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{contributor.topicsCount || 0}</div>
                <div className="stat-label">Topics</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{contributor.commentsCount || 0}</div>
                <div className="stat-label">Comments</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{contributor.votesReceived || 0}</div>
                <div className="stat-label">Votes Received</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{contributor.viewsReceived || 0}</div>
                <div className="stat-label">Total Views</div>
              </div>
            </div>
          </section>

          {/* About Section */}
          {contributor.bio && (
            <section className="profile-section">
              <h2 className="section-title">About</h2>
              <p className="profile-bio">{contributor.bio}</p>
            </section>
          )}

          {/* Education & Background - Only show if exists in mock data */}
          {contributor.background && contributor.background.education && (
            <section className="profile-section">
              <h2 className="section-title">Education & Background</h2>
              <div className="education-list">
                {contributor.background.education.map((edu, index) => (
                  <div key={index} className="education-item">
                    <div className="education-degree">{edu.degree}</div>
                    <div className="education-institution">{edu.institution}</div>
                    <div className="education-year">{edu.year}</div>
                  </div>
                ))}
              </div>
              {contributor.background.specializations && (
                <div className="specializations">
                  <h3 className="subsection-title">Areas of Specialization</h3>
                  <div className="specialization-tags">
                    {contributor.background.specializations.map((spec, index) => (
                      <span key={index} className="specialization-tag">{spec}</span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Achievements, Awards & Certificates - Only show if exists in mock data */}
          {contributor.achievements && contributor.achievements.length > 0 && (
            <section className="profile-section">
              <h2 className="section-title">Achievements, Awards & Certificates</h2>
              <div className="achievements-grid">
                {contributor.achievements.map((achievement, index) => (
                  <div key={index} className="achievement-card">
                    <div className="achievement-type">{achievement.type}</div>
                    <h3 className="achievement-title">{achievement.title}</h3>
                    <div className="achievement-org">{achievement.organization}</div>
                    <div className="achievement-year">{achievement.year}</div>
                    <p className="achievement-description">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Research Topics & Posts */}
          <section className="profile-section">
            <div className="section-header">
              <h2 className="section-title">Research Topics & Propositions</h2>
              <span className="topics-count">{contributor.topicsCount} Topics</span>
            </div>
            {contributorTopics.length > 0 ? (
              <div className="topics-grid">
                {contributorTopics.map((topic) => (
                  <TopicCard
                    key={topic.id}
                    topic={topic}
                    featured={false}
                    onClick={() => handleTopicClick(topic)}
                  />
                ))}
              </div>
            ) : (
              <p className="no-topics">No topics posted yet.</p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ContributorDetailPage

