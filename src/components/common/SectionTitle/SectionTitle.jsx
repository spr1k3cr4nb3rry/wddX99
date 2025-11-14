import React from 'react'
import './SectionTitle.css'

function SectionTitle({ children, className = '' }) {
  return (
    <h2 className={`section-title ${className}`}>
      {children}
    </h2>
  )
}

export default SectionTitle

