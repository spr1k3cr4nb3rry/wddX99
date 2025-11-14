import React, { useState } from 'react'
import NavLink from '../common/NavLink/NavLink'
import Button from '../common/Button/Button'
import LoginModal from '../auth/LoginModal'
import RegisterModal from '../auth/RegisterModal'
import SearchModal from '../common/SearchModal'
import NotificationBell from '../notifications/NotificationBell/NotificationBell'
import { useAuth } from '../../context/AuthContext'
import { canApproveTopic } from '../../utils/permissions'
import './Header.css'

function Header() {
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { user, logout, isAuthenticated } = useAuth()

  const handleLoginClick = () => {
    setIsLoginOpen(true)
  }

  const handleRegisterClick = () => {
    setIsRegisterOpen(true)
  }

  const handleSearchClick = () => {
    setIsSearchOpen(true)
  }

  return (
    <>
      <header className="header">
        <nav className="header-nav">
          <div className="header-left">
            <NavLink to="/">Home</NavLink>
            <span className="nav-separator">|</span>
            <NavLink to="/topics">Topics</NavLink>
            <span className="nav-separator">|</span>
            <NavLink to="/whitepapers">Whitepapers</NavLink>
            <span className="nav-separator">|</span>
            <NavLink to="/about">About</NavLink>
            <span className="nav-separator">|</span>
            <NavLink to="/resources">Resources</NavLink>
          </div>
          <div className="header-right">
            {isAuthenticated ? (
              <>
                <div className="header-user-menu">
                  <NavLink to="/my-topics" className="header-nav-link">
                    My Topics
                  </NavLink>
                  <NavLink to="/bookmarks" className="header-nav-link">
                    Bookmarks
                  </NavLink>
                  {canApproveTopic(user) && (
                    <>
                      <NavLink to="/surveys/create" className="header-nav-link">
                        Create Survey
                      </NavLink>
                      <NavLink to="/admin/panel" className="header-nav-link">
                        Admin
                      </NavLink>
                    </>
                  )}
                </div>
                <div className="header-user-section">
                  <span className="user-name">{user?.name}</span>
                  <NotificationBell />
                  <button 
                    className="btn-search" 
                    aria-label="Search"
                    onClick={handleSearchClick}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </button>
                  <Button 
                    variant="outline" 
                    className="btn-logout"
                    onClick={logout}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <button 
                  className="btn-search" 
                  aria-label="Search"
                  onClick={handleSearchClick}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                </button>
                <Button 
                  variant="outline" 
                  className="btn-login"
                  onClick={handleLoginClick}
                >
                  Login
                </Button>
                <Button 
                  variant="primary" 
                  className="btn-join"
                  onClick={handleRegisterClick}
                >
                  Join
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>
      
      <LoginModal 
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={() => setIsRegisterOpen(true)}
      />
      
      <RegisterModal 
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={() => setIsLoginOpen(true)}
      />
      
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  )
}

export default Header

