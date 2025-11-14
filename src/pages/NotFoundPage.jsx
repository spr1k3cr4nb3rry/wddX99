import React from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import './NotFoundPage.css'

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <Header />
      <main className="not-found-main">
        <div className="not-found-container">
          <div className="not-found-content">
            <h1 className="not-found-title">404</h1>
            <h2 className="not-found-subtitle">Page Not Found</h2>
            <p className="not-found-description">
              The page you're looking for doesn't exist or has been moved. 
              Please check the URL or return to the homepage.
            </p>
            <div className="not-found-actions">
              <Link to="/" className="not-found-button primary">
                Return to Home
              </Link>
              <Link to="/topics" className="not-found-button secondary">
                Browse Topics
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default NotFoundPage

