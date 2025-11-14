import React from 'react'
import { Link } from 'react-router-dom'
import './NavLink.css'

function NavLink({ to, children, className = '' }) {
  return (
    <Link to={to} className={`nav-link ${className}`}>
      {children}
    </Link>
  )
}

export default NavLink

