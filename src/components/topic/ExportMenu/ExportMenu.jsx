import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { printTopic, exportAsPDF, downloadAsText, formatAPACitation, formatMLACitation, formatChicagoCitation, copyToClipboard } from '../../../utils/export'
import './ExportMenu.css'

function ExportMenu({ topic }) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState('')
  const menuRef = useRef(null)
  const buttonRef = useRef(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0, maxHeight: '280px' })

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        const dropdownHeight = 280 // Approximate dropdown height
        const viewportHeight = window.innerHeight
        const spaceBelow = viewportHeight - rect.bottom - 20 // 20px padding from bottom
        const spaceAbove = rect.top - 20 // 20px padding from top
        
        // If not enough space below, position above the button
        let top = rect.bottom + 4
        let maxHeight = Math.min(dropdownHeight, spaceBelow - 8)
        
        if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
          // Position above if there's more space above
          top = rect.top - Math.min(dropdownHeight, spaceAbove - 8) - 4
          maxHeight = Math.min(dropdownHeight, spaceAbove - 8)
        } else {
          // Ensure dropdown doesn't go below viewport
          maxHeight = Math.min(dropdownHeight, spaceBelow - 8)
        }
        
        setDropdownPosition({
          top: top,
          right: window.innerWidth - rect.right,
          maxHeight: `${maxHeight}px`
        })
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      // Calculate dropdown position relative to viewport
      updatePosition()
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [isOpen])

  const handlePrint = () => {
    printTopic(topic)
    setIsOpen(false)
  }

  const handleExportPDF = () => {
    exportAsPDF(topic)
    setIsOpen(false)
  }

  const handleExportText = () => {
    downloadAsText(topic)
    setIsOpen(false)
  }

  const handleCopyCitation = async (format) => {
    let citation = ''
    switch (format) {
      case 'APA':
        citation = formatAPACitation(topic)
        break
      case 'MLA':
        citation = formatMLACitation(topic)
        break
      case 'Chicago':
        citation = formatChicagoCitation(topic)
        break
      default:
        return
    }

    const success = await copyToClipboard(citation)
    if (success) {
      setCopied(format)
      setTimeout(() => setCopied(''), 2000)
    } else {
      alert('Failed to copy citation. Please try again.')
    }
  }

  const dropdownContent = isOpen && (
    <div 
      className="export-menu-dropdown"
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
        maxHeight: dropdownPosition.maxHeight || '280px',
        zIndex: 10000
      }}
    >
          <div className="export-menu-section">
            <div className="export-menu-title">Export Format</div>
            <button onClick={handlePrint} className="export-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              <span>Print</span>
            </button>
            <button onClick={handleExportPDF} className="export-menu-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Export as PDF</span>
            </button>
          </div>

          <div className="export-menu-divider"></div>

          <div className="export-menu-section">
            <div className="export-menu-title">Copy Citation</div>
            <button 
              onClick={() => handleCopyCitation('APA')} 
              className="export-menu-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>APA Format {copied === 'APA' && <span className="copied-indicator">✓ Copied!</span>}</span>
            </button>
            <button 
              onClick={() => handleCopyCitation('MLA')} 
              className="export-menu-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>MLA Format {copied === 'MLA' && <span className="copied-indicator">✓ Copied!</span>}</span>
            </button>
            <button 
              onClick={() => handleCopyCitation('Chicago')} 
              className="export-menu-item"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>Chicago Format {copied === 'Chicago' && <span className="copied-indicator">✓ Copied!</span>}</span>
            </button>
          </div>
        </div>
  )

  return (
    <div className="export-menu-container">
      <button
        ref={buttonRef}
        className="export-menu-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Export options"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        <span>Export</span>
      </button>

      {isOpen && typeof document !== 'undefined' && createPortal(
        dropdownContent,
        document.body
      )}
    </div>
  )
}

export default ExportMenu



