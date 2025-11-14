import React, { useState } from 'react'
import './ImageGallery.css'

function ImageGallery({ images, layout = 'grid', captions = [] }) {
  const [selectedImage, setSelectedImage] = useState(null)

  if (!images || images.length === 0) return null

  const openLightbox = (index) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setSelectedImage((selectedImage + 1) % images.length)
    } else {
      setSelectedImage((selectedImage - 1 + images.length) % images.length)
    }
  }

  return (
    <>
      <div className={`image-gallery image-gallery-${layout}`}>
        {images.map((image, index) => (
          <div key={index} className="gallery-item" onClick={() => openLightbox(index)}>
            <img src={image} alt={captions[index] || `Gallery image ${index + 1}`} />
            {captions[index] && <div className="gallery-caption">{captions[index]}</div>}
          </div>
        ))}
      </div>

      {selectedImage !== null && (
        <div className="lightbox" onClick={closeLightbox}>
          <button className="lightbox-close" onClick={closeLightbox}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <button className="lightbox-prev" onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button className="lightbox-next" onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={images[selectedImage]} alt={captions[selectedImage] || `Image ${selectedImage + 1}`} />
            {captions[selectedImage] && (
              <div className="lightbox-caption">{captions[selectedImage]}</div>
            )}
            <div className="lightbox-counter">{selectedImage + 1} / {images.length}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageGallery

