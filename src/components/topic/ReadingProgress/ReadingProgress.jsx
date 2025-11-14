import React, { useState, useEffect, useRef } from 'react'
import './ReadingProgress.css'

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  const rafIdRef = useRef(null)

  useEffect(() => {
    const updateProgress = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || window.pageYOffset
      const scrollableHeight = documentHeight - windowHeight
      
      if (scrollableHeight > 0) {
        const progressPercent = (scrollTop / scrollableHeight) * 100
        const newProgress = Math.min(100, Math.max(0, progressPercent))
        setProgress(newProgress)
      }
    }
    
    const handleScroll = () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(updateProgress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial calculation

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  return (
    <div className="reading-progress">
      <div 
        className="reading-progress-bar" 
        style={{ transform: `scaleX(${progress / 100})` }}
      />
    </div>
  )
}

export default ReadingProgress

