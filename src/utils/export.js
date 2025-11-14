/**
 * Export utilities for topics
 */

/**
 * Format citation in APA style
 */
export function formatAPACitation(topic) {
  const author = topic.author?.name || 'Unknown Author'
  const year = new Date(topic.createdAt).getFullYear()
  const title = topic.title
  const siteName = 'BYU-Idaho Education Platform'
  const url = window.location.href
  const accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return `${author} (${year}). ${title}. ${siteName}. Retrieved ${accessDate}, from ${url}`
}

/**
 * Format citation in MLA style
 */
export function formatMLACitation(topic) {
  const author = topic.author?.name || 'Unknown Author'
  const title = topic.title
  const siteName = 'BYU-Idaho Education Platform'
  const publisher = 'BYU-Idaho'
  const date = new Date(topic.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const url = window.location.href
  const accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return `${author}. "${title}." ${siteName}, ${publisher}, ${date}, ${url}. Accessed ${accessDate}.`
}

/**
 * Format citation in Chicago style
 */
export function formatChicagoCitation(topic) {
  const author = topic.author?.name || 'Unknown Author'
  const title = topic.title
  const siteName = 'BYU-Idaho Education Platform'
  const date = new Date(topic.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  const url = window.location.href
  const accessDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return `${author}. "${title}." ${siteName}. Last modified ${date}. Accessed ${accessDate}. ${url}.`
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    try {
      document.execCommand('copy')
      textArea.remove()
      return true
    } catch (err) {
      textArea.remove()
      return false
    }
  }
}

/**
 * Print topic
 */
export function printTopic(topic) {
  const printWindow = window.open('', '_blank')
  const printContent = generatePrintHTML(topic)
  
  printWindow.document.write(printContent)
  printWindow.document.close()
  printWindow.focus()
  
  // Wait for content to load, then print
  setTimeout(() => {
    printWindow.print()
    // Close window after printing (optional)
    // printWindow.close()
  }, 250)
}

/**
 * Generate HTML for printing
 */
function generatePrintHTML(topic) {
  const author = topic.author?.name || 'Unknown Author'
  const date = new Date(topic.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  let sectionsHTML = ''
  if (topic.content?.sections) {
    sectionsHTML = topic.content.sections.map(section => `
      <section style="margin-bottom: 2rem;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">${section.title}</h2>
        ${Array.isArray(section.content) 
          ? section.content.map(para => `<p style="margin-bottom: 1rem; line-height: 1.7; color: #374151;">${para}</p>`).join('')
          : `<p style="margin-bottom: 1rem; line-height: 1.7; color: #374151;">${section.content}</p>`
        }
      </section>
    `).join('')
  }

  let referencesHTML = ''
  if (topic.content?.references && topic.content.references.length > 0) {
    referencesHTML = `
      <section style="margin-top: 3rem; page-break-before: always;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #111827;">References</h2>
        <ol style="list-style: decimal; padding-left: 2rem;">
          ${topic.content.references.map(ref => `<li style="margin-bottom: 0.5rem; line-height: 1.7; color: #374151;">${ref}</li>`).join('')}
        </ol>
      </section>
    `
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${topic.title}</title>
      <style>
        @media print {
          @page {
            margin: 2cm;
          }
          body {
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #000;
            max-width: 100%;
          }
          h1, h2, h3 {
            page-break-after: avoid;
          }
          section {
            page-break-inside: avoid;
          }
          img {
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
          }
        }
        body {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #000;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
        }
        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 1rem;
          margin-bottom: 2rem;
        }
        .title {
          font-size: 24pt;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .meta {
          font-size: 10pt;
          color: #666;
          margin-bottom: 1rem;
        }
        .abstract {
          font-style: italic;
          margin-bottom: 2rem;
          padding: 1rem;
          background-color: #f9fafb;
          border-left: 4px solid #006EB6;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="title">${topic.title}</h1>
        <div class="meta">
          <p><strong>Author:</strong> ${author}</p>
          <p><strong>Published:</strong> ${date}</p>
          ${topic.category ? `<p><strong>Category:</strong> ${topic.category}</p>` : ''}
          ${topic.tags && topic.tags.length > 0 ? `<p><strong>Tags:</strong> ${topic.tags.join(', ')}</p>` : ''}
        </div>
      </div>
      
      ${topic.abstract ? `<div class="abstract"><strong>Abstract:</strong> ${topic.abstract}</div>` : ''}
      
      ${sectionsHTML}
      
      ${referencesHTML}
      
      <div style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #ccc; font-size: 10pt; color: #666;">
        <p>Source: BYU-Idaho Education Platform</p>
        <p>URL: ${window.location.href}</p>
        <p>Printed: ${new Date().toLocaleString()}</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Export topic as PDF (using browser print to PDF)
 */
export function exportAsPDF(topic) {
  printTopic(topic) // For now, use print which can be saved as PDF
}

/**
 * Download topic as text file
 */
export function downloadAsText(topic) {
  const author = topic.author?.name || 'Unknown Author'
  const date = new Date(topic.createdAt).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
  
  let text = `${topic.title}\n`
  text += `\nAuthor: ${author}\n`
  text += `Published: ${date}\n`
  if (topic.category) text += `Category: ${topic.category}\n`
  if (topic.tags && topic.tags.length > 0) text += `Tags: ${topic.tags.join(', ')}\n`
  text += `\n${'='.repeat(50)}\n\n`
  
  if (topic.abstract) {
    text += `ABSTRACT\n${'-'.repeat(50)}\n${topic.abstract}\n\n`
  }
  
  if (topic.content?.sections) {
    topic.content.sections.forEach(section => {
      text += `${section.title}\n${'-'.repeat(50)}\n`
      if (Array.isArray(section.content)) {
        section.content.forEach(para => {
          text += `${para}\n\n`
        })
      } else {
        text += `${section.content}\n\n`
      }
    })
  }
  
  if (topic.content?.references && topic.content.references.length > 0) {
    text += `\n${'='.repeat(50)}\n`
    text += `REFERENCES\n${'-'.repeat(50)}\n`
    topic.content.references.forEach((ref, index) => {
      text += `${index + 1}. ${ref}\n`
    })
  }
  
  text += `\n\n${'='.repeat(50)}\n`
  text += `Source: BYU-Idaho Education Platform\n`
  text += `URL: ${window.location.href}\n`
  text += `Exported: ${new Date().toLocaleString()}\n`
  
  const blob = new Blob([text], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${topic.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}



