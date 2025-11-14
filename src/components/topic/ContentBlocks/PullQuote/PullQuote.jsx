import React from 'react'
import './PullQuote.css'

function PullQuote({ quote, author, alignment = 'center' }) {
  if (!quote) return null

  return (
    <div className={`pull-quote pull-quote-${alignment}`}>
      <blockquote className="pull-quote-text">
        {quote}
      </blockquote>
      {author && (
        <cite className="pull-quote-author">— {author}</cite>
      )}
    </div>
  )
}

export default PullQuote

