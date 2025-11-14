import React from 'react'
import './ArticleSection.css'

function ArticleSection({ id, title, content, level = 2 }) {
  const HeadingTag = `h${level}`

  return (
    <section id={id} className="article-section">
      <HeadingTag className="article-section-title">{title}</HeadingTag>
      <div className="article-section-content">
        {Array.isArray(content) ? (
          content.map((paragraph, index) => (
            <p key={index} className="article-paragraph">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="article-paragraph">{content}</p>
        )}
      </div>
    </section>
  )
}

export default ArticleSection

