import React from 'react'
import { useNavigate } from 'react-router-dom'
import SectionTitle from '../../common/SectionTitle/SectionTitle'
import ContributorCard from '../../common/ContributorCard/ContributorCard'
import './TopContributors.css'

function TopContributors() {
  const navigate = useNavigate()
  
  const contributors = [
    {
      id: 1,
      name: 'Elena M. Calder',
      title: 'Associate Professor, Department of Education | BYU-Idaho',
      description: 'Dr. Calder explores how technology transforms teaching and learning, working closely with students and local schools to innovate education.',
      topicsCount: 12,
      image: '/images/womenheadshot.jpg'
    },
    {
      id: 2,
      name: 'Marcus T. Holloway',
      title: 'Professor, Department of Educational Leadership | BYU-Idaho',
      description: 'Dr. Holloway studies leadership strategies in K-12 schools, focusing on how principals and administrators can foster inclusive, high-performing learning environments.',
      topicsCount: 10,
      image: '/images/manheadshot.jpg'
    }
  ]

  const handleContributorClick = (contributor) => {
    navigate(`/contributor/${contributor.id}`)
  }

  return (
    <section className="top-contributors">
      <div className="contributors-container">
        <SectionTitle>Top Contributors</SectionTitle>
        <p className="contributors-intro">
          Meet our top contributors! Recognized for sharing insightful research ideas and sparking meaningful discussions, they help drive collaboration and innovation in education.
        </p>
        <div className="contributors-grid">
          {contributors.map((contributor) => (
            <ContributorCard
              key={contributor.id}
              contributor={contributor}
              onClick={() => handleContributorClick(contributor)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopContributors

