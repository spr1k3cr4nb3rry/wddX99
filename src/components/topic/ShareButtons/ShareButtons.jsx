import React, { useState } from 'react'
import './ShareButtons.css'

function ShareButtons({ title, url }) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url || window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = (platform) => {
    const shareUrl = encodeURIComponent(url || window.location.href)
    const shareTitle = encodeURIComponent(title || '')
    let shareLink = ''

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`
        break
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`
        break
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`
        break
      default:
        return
    }

    window.open(shareLink, '_blank', 'width=600,height=400')
  }

  return (
    <div className="share-buttons">
      <h3 className="share-title">Share</h3>
      <div className="share-actions">
        <button
          className="share-btn share-copy"
          onClick={handleCopyLink}
          title="Copy link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>
        <button
          className="share-btn share-twitter"
          onClick={() => handleShare('twitter')}
          title="Share on Twitter"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
          </svg>
        </button>
        <button
          className="share-btn share-facebook"
          onClick={() => handleShare('facebook')}
          title="Share on Facebook"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
          </svg>
        </button>
        <button
          className="share-btn share-linkedin"
          onClick={() => handleShare('linkedin')}
          title="Share on LinkedIn"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default ShareButtons

