import React from 'react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import './WhitepaperLibraryPage.css'

const WhitepaperLibraryPage = () => {

  return (
    <div className="whitepaper-library-page">
      <Header />
      <main className="whitepaper-library-main">
        <div className="page-header">
          <h1>Whitepaper Library</h1>
          <p>Browse our collection of educational whitepapers</p>
        </div>

        <div className="coming-soon-container">
          <div className="coming-soon-content">
            <h2>Coming Soon</h2>
            <p>The Whitepaper Library is currently under development. Check back soon for access to our comprehensive collection of educational whitepapers, research papers, and academic resources.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default WhitepaperLibraryPage

