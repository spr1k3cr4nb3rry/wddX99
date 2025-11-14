import React, { useState, useRef, useEffect } from 'react'
import './LazyImage.css'

function LazyImage({ src, alt, className = '', placeholder = '/images/placeholder.svg', ...props }) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)

  useEffect(() => {
    if (!src) {
      setIsLoading(false)
      return
    }

    // Check if image is already in viewport or nearby
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Start loading the image
            const img = new Image()
            img.onload = () => {
              setImageSrc(src)
              setIsLoading(false)
              setHasError(false)
            }
            img.onerror = () => {
              setHasError(true)
              setIsLoading(false)
            }
            img.src = src
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '50px' // Start loading 50px before image enters viewport
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [src])

  return (
    <>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'lazy-image-loading' : ''} ${hasError ? 'lazy-image-error' : ''}`}
        {...props}
      />
      {isLoading && (
        <div className="lazy-image-spinner">
          <div className="spinner"></div>
        </div>
      )}
    </>
  )
}

export default LazyImage

