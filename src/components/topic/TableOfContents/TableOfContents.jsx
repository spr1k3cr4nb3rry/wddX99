import React, { useState, useEffect } from 'react'
import './TableOfContents.css'

function TableOfContents({ sections }) {
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      // Find active section
      const sectionElements = sections.map(s => {
        const el = document.getElementById(s.id)
        return el ? { id: s.id, top: el.getBoundingClientRect().top } : null
      }).filter(Boolean)

      const currentSection = sectionElements.find((s, index) => {
        const next = sectionElements[index + 1]
        return s.top <= 150 && (!next || next.top > 150)
      })

      if (currentSection) {
        setActiveSection(currentSection.id)
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [sections])

  const handleClick = (id, e) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  if (!sections || sections.length === 0) return null

  return (
    <nav className="table-of-contents">
      <h3 className="toc-title">Table of Contents</h3>
      <ul className="toc-list">
        {sections.map((section) => (
          <li key={section.id} className="toc-item">
            <a
              href={`#${section.id}`}
              onClick={(e) => handleClick(section.id, e)}
              className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
            >
              {section.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents

