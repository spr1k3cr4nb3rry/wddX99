import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { topicsAPI, uploadAPI } from '../services/api'
import ReadingProgress from '../components/topic/ReadingProgress/ReadingProgress'
import TableOfContents from '../components/topic/TableOfContents/TableOfContents'
import ArticleSection from '../components/topic/ArticleSection/ArticleSection'
import Visualization from '../components/topic/Visualization/Visualization'
import ArticleMeta from '../components/topic/ArticleMeta/ArticleMeta'
import ShareButtons from '../components/topic/ShareButtons/ShareButtons'
import ExportMenu from '../components/topic/ExportMenu/ExportMenu'
import { PullQuote, CTABox, InfoBox, CodeBlock, ImageGallery } from '../components/topic/ContentBlocks'
import YesNoVote from '../components/voting/YesNoVote'
import './CreateTopicPage.css'
import './TopicDetailPage.css'

function EditTopicPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPreview, setIsPreview] = useState(() => {
    // Check if we're coming from a preview refresh
    return sessionStorage.getItem(`preview-${id}`) === 'true'
  })
  const [topic, setTopic] = useState(null)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    image: '',
    abstract: '',
    authorBio: '',
    references: '',
    readTime: ''
  })

  const [sections, setSections] = useState([
    { id: 1, title: '', paragraphs: [''] }
  ])

  const [visualizations, setVisualizations] = useState([])
  const [imagePreview, setImagePreview] = useState('')
  const [contentBlocks, setContentBlocks] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)

  const isAdmin = user?.role === 'admin'
  const categories = ['Technology', 'Education', 'Career Development', 'Learning', 'Research']
  
  // Customization settings (default)
  const customization = {
    typography: {
      fontSize: 'medium',
      lineHeight: 'normal',
      fontFamily: 'serif',
      textWidth: 'medium'
    },
    layout: 'classic',
    colorScheme: 'academic-blue'
  }
  
  // Generate preview topic object
  const getPreviewTopic = () => {
    const tagsArray = (formData.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag)
    const articleSections = (sections || [])
      .filter(s => s && (s.title && s.title.trim() || (s.paragraphs && Array.isArray(s.paragraphs) && s.paragraphs.some(p => p && p.trim()))))
      .map(s => ({
        id: (s.title && s.title.trim() ? s.title.toLowerCase().replace(/\s+/g, '-') : `section-${s.id || 0}`),
        title: (s.title && s.title.trim()) || 'Untitled Section',
        content: (s.paragraphs || []).filter(p => p && p.trim())
      }))
      .filter(s => s && s.content && s.content.length > 0)
    
    const referencesArray = (formData.references || '')
      .split('\n')
      .map(ref => ref.trim())
      .filter(ref => ref)
    
    return {
      id: 'preview',
      title: formData.title || 'Untitled Topic',
      description: formData.description || '',
      abstract: formData.abstract || '',
      category: formData.category || 'Uncategorized',
      tags: tagsArray,
      image: formData.image || '/images/placeholder.svg',
      author: {
        name: user?.name || 'Unknown Author',
        avatar: user?.avatar || '/images/placeholder.svg',
        title: '',
        bio: formData.authorBio || ''
      },
      votes: 0,
      commentsCount: 0,
      views: 0,
      readTime: formData.readTime ? parseInt(formData.readTime) : calculateReadTime(),
      status: 'Draft',
      createdAt: new Date().toISOString(),
      content: {
        sections: articleSections,
        references: referencesArray
      },
      visualizations: prepareVisualizations(),
      contentBlocks: contentBlocks || []
    }
  }
  
  // Calculate read time (only if not manually set)
  const calculateReadTime = () => {
    let wordCount = 0
    if (formData.title) wordCount += formData.title.split(/\s+/).length
    if (formData.description) wordCount += formData.description.split(/\s+/).length
    if (formData.abstract) wordCount += formData.abstract.split(/\s+/).length
    sections.forEach(section => {
      if (section.paragraphs) {
        section.paragraphs.forEach(para => {
          if (para && para.trim()) wordCount += para.split(/\s+/).length
        })
      }
    })
    if (formData.authorBio) wordCount += formData.authorBio.split(/\s+/).length
    const minutes = Math.ceil(wordCount / 200)
    return minutes || 1
  }
  
  // Render content blocks
  const renderContentBlock = (block) => {
    if (!block) return null
    if (block.type === 'pullQuote' && block.quote) {
      return <PullQuote key={block.id} quote={block.quote} author={block.author} alignment={block.alignment} />
    }
    if (block.type === 'ctaBox' && (block.title || block.description)) {
      return <CTABox key={block.id} title={block.title} description={block.description} buttonText={block.buttonText} buttonLink={block.buttonLink} variant={block.variant} />
    }
    if (block.type === 'infoBox' && block.content) {
      return <InfoBox key={block.id} type={block.boxType} title={block.title} content={block.content} />
    }
    if (block.type === 'codeBlock' && block.code) {
      return <CodeBlock key={block.id} code={block.code} language={block.language} showLineNumbers={block.showLineNumbers} />
    }
    if (block.type === 'imageGallery' && block.images && block.images.some(img => img)) {
      return <ImageGallery key={block.id} images={block.images.filter(img => img)} captions={block.captions || []} layout={block.layout} />
    }
    return null
  }

  // Load topic data
  useEffect(() => {
    // Wait for user to be loaded before checking permissions
    if (user !== undefined) {
      loadTopic()
    }
  }, [id, user])

  const loadTopic = async () => {
    setLoading(true)
    setError('')
    try {
      const topicData = await topicsAPI.getById(id)
      
      // Check permissions - only author or admin can edit
      // Skip permission check if user is not loaded yet (will retry when user loads)
      // Also skip if we're in preview mode (user might have navigated here from preview)
      if (user !== undefined && !isPreview) {
        const userId = user?.id || user?.userId
        const userIsAdmin = user?.role === 'admin'
        if (!userIsAdmin && topicData.user_id !== userId) {
          setError('You do not have permission to edit this topic.')
          setLoading(false)
          return
        }
      }

      setTopic(topicData)

      // Populate form data
      const loadedImage = topicData.image || ''
      setFormData({
        title: topicData.title || '',
        description: topicData.description || '',
        category: topicData.category || '',
        tags: Array.isArray(topicData.tags) ? topicData.tags.join(', ') : '',
        image: loadedImage,
        abstract: topicData.abstract || '',
        authorBio: topicData.author_bio || '',
        references: topicData.content?.references ? topicData.content.references.join('\n') : '',
        readTime: topicData.read_time || ''
      })
      // Set image preview
      if (loadedImage) {
        setImagePreview(loadedImage)
      }

      // Populate sections
      if (topicData.content?.sections && topicData.content.sections.length > 0) {
        setSections(topicData.content.sections.map((section, index) => ({
          id: index + 1,
          title: section.title || '',
          paragraphs: Array.isArray(section.content) ? section.content : [section.content || '']
        })))
      } else {
        setSections([{ id: 1, title: '', paragraphs: [''] }])
      }

      // Populate content blocks
      if (topicData.content_blocks && Array.isArray(topicData.content_blocks)) {
        setContentBlocks(topicData.content_blocks)
      } else if (topicData.content?.contentBlocks && Array.isArray(topicData.content.contentBlocks)) {
        setContentBlocks(topicData.content.contentBlocks)
      } else {
        setContentBlocks([])
      }

      // Populate visualizations
      if (topicData.visualizations && Array.isArray(topicData.visualizations) && topicData.visualizations.length > 0) {
        setVisualizations(topicData.visualizations.map((viz, index) => {
          // Extract dataKey from config based on chart type
          let dataKey = 'value'
          if (viz.type === 'bar' && viz.config?.bars?.[0]?.dataKey) {
            dataKey = viz.config.bars[0].dataKey
          } else if (viz.type === 'line' && viz.config?.lines?.[0]?.dataKey) {
            dataKey = viz.config.lines[0].dataKey
          } else if (viz.type === 'pie' && viz.config?.dataKey) {
            dataKey = viz.config.dataKey
          } else if (viz.config?.dataKey) {
            dataKey = viz.config.dataKey
          }
          
          // Convert visualization data back to dataRows format
          const dataRows = Array.isArray(viz.data) && viz.data.length > 0
            ? viz.data.map(d => {
                const name = d.name || d[viz.config?.xKey || 'name'] || ''
                const value = d[dataKey] || d.value || ''
                return { name, value: String(value) }
              })
            : [{ name: '', value: '' }]
          
          return {
            id: index + 1,
            type: viz.type || 'bar',
            title: viz.title || '',
            description: viz.config?.description || '',
            dataRows,
            xKey: viz.config?.xKey || 'name',
            dataKey
          }
        }))
      } else {
        setVisualizations([])
      }
    } catch (err) {
      setError(err.message || 'Failed to load topic')
    } finally {
      setLoading(false)
    }
  }

  // Scroll to top when preview is opened and persist preview state
  useEffect(() => {
    if (isPreview) {
      window.scrollTo({ top: 0, behavior: 'auto' })
      sessionStorage.setItem(`preview-${id}`, 'true')
    } else {
      sessionStorage.removeItem(`preview-${id}`)
    }
  }, [isPreview, id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Update preview if image URL changes
    if (name === 'image') {
      setImagePreview(value)
    }
    if (error) setError('')
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      const result = await uploadAPI.uploadImage(file)
      setFormData(prev => ({
        ...prev,
        image: result.path
      }))
      setImagePreview(result.path)
      setSuccess('Image uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: ''
    }))
    setImagePreview('')
  }

  const addSection = () => {
    const newId = sections.length > 0 ? Math.max(...sections.map(s => s.id)) + 1 : 1
    setSections([...sections, { id: newId, title: '', paragraphs: [''] }])
  }

  const removeSection = (sectionId) => {
    if (sections.length > 1) {
      setSections(sections.filter(s => s.id !== sectionId))
    }
  }

  const updateSectionTitle = (sectionId, title) => {
    setSections(sections.map(s => s.id === sectionId ? { ...s, title } : s))
  }

  const updateSectionParagraph = (sectionId, paragraphIndex, value) => {
    setSections(sections.map(s => {
      if (s.id === sectionId) {
        const newParagraphs = [...s.paragraphs]
        newParagraphs[paragraphIndex] = value
        return { ...s, paragraphs: newParagraphs }
      }
      return s
    }))
  }

  const addParagraph = (sectionId) => {
    setSections(sections.map(s => 
      s.id === sectionId ? { ...s, paragraphs: [...s.paragraphs, ''] } : s
    ))
  }

  const removeParagraph = (sectionId, paragraphIndex) => {
    setSections(sections.map(s => {
      if (s.id === sectionId && s.paragraphs.length > 1) {
        return { ...s, paragraphs: s.paragraphs.filter((_, i) => i !== paragraphIndex) }
      }
      return s
    }))
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }
    if (formData.title.length > 500) {
      setError('Title must be 500 characters or less')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    if (!formData.tags.trim()) {
      setError('At least one tag is required')
      return false
    }
    return true
  }

  const addVisualization = () => {
    const newId = visualizations.length > 0 ? Math.max(...visualizations.map(v => v.id)) + 1 : 1
    setVisualizations([...visualizations, {
      id: newId,
      type: 'bar',
      title: '',
      description: '',
      dataRows: [{ name: '', value: '' }],
      xKey: 'name',
      dataKey: 'value'
    }])
  }

  const removeVisualization = (vizId) => {
    setVisualizations(visualizations.filter(v => v.id !== vizId))
  }

  const updateVisualization = (vizId, field, value) => {
    setVisualizations(visualizations.map(v => 
      v.id === vizId ? { ...v, [field]: value } : v
    ))
  }

  const addDataRow = (vizId) => {
    setVisualizations(visualizations.map(v => 
      v.id === vizId ? { ...v, dataRows: [...v.dataRows, { name: '', value: '' }] } : v
    ))
  }

  const removeDataRow = (vizId, rowIndex) => {
    setVisualizations(visualizations.map(v => {
      if (v.id === vizId && v.dataRows.length > 1) {
        return { ...v, dataRows: v.dataRows.filter((_, i) => i !== rowIndex) }
      }
      return v
    }))
  }

  const updateDataRow = (vizId, rowIndex, field, value) => {
    setVisualizations(visualizations.map(v => {
      if (v.id === vizId) {
        const newRows = [...(v.dataRows || [])]
        if (!newRows[rowIndex]) {
          newRows[rowIndex] = { name: '', value: '' }
        }
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value }
        return { ...v, dataRows: newRows }
      }
      return v
    }))
  }

  // Prepare a single visualization for preview
  const prepareSingleVisualization = (viz) => {
    if (!viz) return null
    
    try {
      // Convert dataRows to proper data format
      const dataKey = viz.dataKey || 'value'
      
      // Filter and validate data rows - be more lenient for preview
      const validRows = (viz.dataRows || []).filter(r => {
        if (!r) return false
        // Require at least a name
        if (!r.name || !r.name.trim()) return false
        // For preview, allow empty values (they'll be 0) but filter out completely invalid entries
        const valueStr = String(r.value || '').trim()
        // Allow empty string (will become 0), but reject if it's explicitly null/undefined
        return r.value !== null && r.value !== undefined
      })
      
      if (validRows.length === 0) return null
      
      // Determine the xKey to use (default to 'name')
      const xKey = viz.xKey || 'name'
      
      const data = validRows.map(r => {
        // Use the xKey for the label field (e.g., 'name', 'year', etc.)
        const obj = { [xKey]: r.name.trim() }
        // For bar/line charts, add value as a numeric field
        if (viz.type === 'bar' || viz.type === 'line') {
          const valueStr = String(r.value || '').trim()
          const numValue = valueStr === '' ? 0 : (typeof r.value === 'string' ? parseFloat(valueStr) : Number(r.value))
          obj[dataKey] = isNaN(numValue) ? 0 : numValue
        } else if (viz.type === 'pie') {
          const valueStr = String(r.value || '').trim()
          const numValue = valueStr === '' ? 0 : (typeof r.value === 'string' ? parseFloat(valueStr) : Number(r.value))
          obj.value = isNaN(numValue) ? 0 : numValue
          // For pie charts, also keep 'name' for compatibility
          obj.name = r.name.trim()
        }
        return obj
      })

      if (data.length === 0) return null

      const config = {
        xKey: xKey,
        description: viz.description || null
      }

      if (viz.type === 'bar') {
        config.bars = [{ dataKey: dataKey, name: dataKey }]
      } else if (viz.type === 'line') {
        config.lines = [{ dataKey: dataKey, name: dataKey }]
      } else if (viz.type === 'pie') {
        config.dataKey = 'value'
        config.nameKey = 'name'
      }

      return {
        type: viz.type,
        title: (viz.title && viz.title.trim()) || 'Untitled Chart',
        data,
        config
      }
    } catch (error) {
      console.error('Error preparing visualization:', error, viz)
      return null
    }
  }

  const prepareVisualizations = () => {
    if (!visualizations || !Array.isArray(visualizations)) return []
    
    return visualizations
      .map(v => prepareSingleVisualization(v))
      .filter(v => v !== null && v.data && v.data.length > 0)
  }

  const prepareTopicData = () => {
    const tagsArray = (formData.tags || '').split(',').map(tag => tag.trim()).filter(tag => tag)
    
    const contentSections = (sections || [])
      .filter(s => s && (s.title && s.title.trim() || (s.paragraphs && Array.isArray(s.paragraphs) && s.paragraphs.some(p => p && p.trim()))))
      .map(s => ({
        id: (s.title && s.title.trim() ? s.title.toLowerCase().replace(/\s+/g, '-') : `section-${s.id || 0}`),
        title: (s.title && s.title.trim()) || 'Untitled Section',
        content: (s.paragraphs || []).filter(p => p && p.trim())
      }))
      .filter(s => s && s.content && s.content.length > 0)

    const referencesArray = (formData.references || '')
      .split('\n')
      .map(ref => ref.trim())
      .filter(ref => ref)

    // Prepare visualizations
    const visualizationsArray = prepareVisualizations()

    return {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      tags: tagsArray,
      image: formData.image || null,
      abstract: formData.abstract || null,
      author_bio: formData.authorBio || null,
      read_time: formData.readTime ? parseInt(formData.readTime) : null,
      content: {
        sections: contentSections,
        references: referencesArray
      },
      visualizations: visualizationsArray
    }
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    setError('')
    
    try {
      const topicData = prepareTopicData()
      await topicsAPI.update(id, topicData)
      setSuccess('Topic updated successfully!')
      setTimeout(() => {
        navigate(`/topic/${id}`)
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to update topic. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="create-topic-page">
        <Header />
        <main className="create-topic-main">
          <div className="create-topic-container">
            <div className="loading-message">Loading topic...</div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error && !topic) {
    return (
      <div className="create-topic-page">
        <Header />
        <main className="create-topic-main">
          <div className="create-topic-container">
            <div className="access-denied">
              <h2>Error</h2>
              <p>{error}</p>
              <button onClick={() => navigate('/topics')} className="btn-back">
                Back to Topics
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (isPreview) {
    return (
      <div className="topic-detail-page" data-color-scheme={customization.colorScheme}>
        <ReadingProgress />
        <Header />
        <main className="topic-detail-main">
          <div className="topic-detail-container">
            <button 
              className="back-button" 
              onClick={() => setIsPreview(false)}
            >
              ← Back to Edit
            </button>
            {(() => {
                    const previewTopic = getPreviewTopic()
                    const articleSections = previewTopic.content.sections || []
                    const hasFullArticle = articleSections.length > 0
                    const visualizations = previewTopic.visualizations || []
                    const contentBlocks = previewTopic.contentBlocks || []
                    
                    return (
                      <div className="topic-layout">
                        <div className="topic-main-content">
                          <article 
                            className={`topic-article topic-layout-${customization.layout}`}
                            style={{
                              fontSize: customization.typography?.fontSize === 'small' ? '14px' : 
                                        customization.typography?.fontSize === 'medium' ? '16px' :
                                        customization.typography?.fontSize === 'large' ? '18px' : '20px',
                              lineHeight: customization.typography?.lineHeight === 'tight' ? '1.5' :
                                         customization.typography?.lineHeight === 'normal' ? '1.7' : '1.9',
                              maxWidth: customization.typography?.textWidth === 'narrow' ? '800px' :
                                       customization.typography?.textWidth === 'medium' ? '1000px' :
                                       customization.typography?.textWidth === 'wide' ? '1200px' : '100%',
                              fontFamily: customization.typography?.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                                         customization.typography?.fontFamily === 'sans-serif' ? 'Inter, system-ui, sans-serif' :
                                         customization.typography?.fontFamily === 'monospace' ? '"Courier New", Courier, monospace' :
                                         'Georgia, "Times New Roman", serif',
                              margin: '0 auto'
                            }}
                          >
                            <div className="topic-header">
                              <div className="topic-meta-top">
                                <div className="topic-author-info">
                                  <img src={previewTopic.author.avatar} alt={previewTopic.author.name} className="author-avatar-large" />
                                  <div>
                                    <p className="author-name-large">{previewTopic.author.name}</p>
                                    {previewTopic.author.title && (
                                      <p className="author-title">{previewTopic.author.title}</p>
                                    )}
                                  </div>
                                </div>
                                <span className={`topic-status-badge status-${previewTopic.status.toLowerCase()}`}>
                                  {previewTopic.status}
                                </span>
                              </div>

                              <h1 className="topic-title-large">{previewTopic.title}</h1>
                              
                              {previewTopic.tags && previewTopic.tags.length > 0 && (
                                <div className="topic-tags-large">
                                  {previewTopic.tags.map((tag, index) => (
                                    <span key={index} className="topic-tag-large">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {previewTopic.image && (
                              <div className="topic-image-container">
                                <img src={previewTopic.image} alt={previewTopic.title} className="topic-image-large" />
                              </div>
                            )}

                            <div className="topic-content">
                              <YesNoVote 
                                propositionId={previewTopic.id} 
                                propositionType="topic"
                              />
                              
                              <div className="topic-stats-bar">
                                <div className="stat-item-large">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                  </svg>
                                  <span>{previewTopic.commentsCount} Comments</span>
                                </div>
                                <div className="stat-item-large">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                  </svg>
                                  <span>{previewTopic.views} Views</span>
                                </div>
                                <div className="stat-item-large">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                  </svg>
                                  <span>{previewTopic.readTime} min read</span>
                                </div>
                                <div className="export-menu-wrapper">
                                  <ExportMenu topic={previewTopic} />
                                </div>
                              </div>

                              {previewTopic.abstract && (
                                <div className="article-abstract">
                                  <h2 className="abstract-title">Abstract</h2>
                                  <p className="abstract-content">{previewTopic.abstract}</p>
                                </div>
                              )}

                              {hasFullArticle && articleSections.length > 0 && (
                                <>
                                  {articleSections.map((section, index) => {
                                    const shouldShowViz = index > 0 && (index + 1) % 3 === 0
                                    const vizIndex = shouldShowViz ? Math.floor((index + 1) / 3) - 1 : -1
                                    
                                    const sectionBlocks = contentBlocks.filter(b => 
                                      b.position === 'after-section' || (!b.position && index === articleSections.length - 1)
                                    )
                                    
                                    return (
                                      <React.Fragment key={section.id}>
                                        <ArticleSection
                                          id={section.id}
                                          title={section.title}
                                          content={section.content}
                                          level={2}
                                        />
                                        {shouldShowViz && vizIndex >= 0 && vizIndex < visualizations.length && (
                                          <Visualization
                                            type={visualizations[vizIndex].type}
                                            title={visualizations[vizIndex].title}
                                            data={visualizations[vizIndex].data}
                                            config={visualizations[vizIndex].config}
                                          />
                                        )}
                                        {sectionBlocks.map(block => renderContentBlock(block))}
                                      </React.Fragment>
                                    )
                                  })}
                                  {contentBlocks
                                    .filter(b => b.position === 'after-all' || (!b.position && articleSections.length === 0))
                                    .map(block => renderContentBlock(block))}
                                </>
                              )}

                              {visualizations.length > 0 && !hasFullArticle && (
                                <div className="visualizations-section">
                                  <h2 className="section-title">Data & Visualizations</h2>
                                  {visualizations.map((viz, index) => (
                                    <Visualization
                                      key={index}
                                      type={viz.type}
                                      title={viz.title}
                                      data={viz.data}
                                      config={viz.config}
                                    />
                                  ))}
                                </div>
                              )}

                              {hasFullArticle && previewTopic.content?.references && previewTopic.content.references.length > 0 && (
                                <section id="references" className="references-section">
                                  <h2 className="references-title">References</h2>
                                  <ol className="references-list">
                                    {previewTopic.content.references.map((ref, index) => (
                                      <li key={index} className="reference-item">{ref}</li>
                                    ))}
                                  </ol>
                                </section>
                              )}

                              {hasFullArticle && previewTopic.author?.bio && (
                                <section id="author-bio" className="author-bio-section">
                                  <h2 className="author-bio-title">About the Author</h2>
                                  <div className="author-bio-content">
                                    <img 
                                      src={previewTopic.author.avatar || '/images/placeholder.svg'} 
                                      alt={previewTopic.author.name}
                                      className="author-bio-avatar"
                                    />
                                    <div className="author-bio-text">
                                      <h3 className="author-bio-name">{previewTopic.author.name}</h3>
                                      {previewTopic.author.title && (
                                        <p className="author-bio-title-text">{previewTopic.author.title}</p>
                                      )}
                                      <p className="author-bio-description">{previewTopic.author.bio}</p>
                                    </div>
                                  </div>
                                </section>
                              )}
                            </div>
                          </article>
                        </div>

                        <aside className="topic-sidebar">
                          {hasFullArticle && articleSections.length > 0 && (
                            <TableOfContents sections={articleSections} />
                          )}
                          <ArticleMeta topic={previewTopic} />
                          <ExportMenu topic={previewTopic} />
                          <ShareButtons title={previewTopic.title} url={typeof window !== 'undefined' ? window.location.href : ''} />
                        </aside>
                      </div>
                    )
                  })()}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="create-topic-page">
      <Header />
      <main className="create-topic-main">
        <div className="create-topic-container">
          <div className="create-topic-header">
            <button onClick={() => navigate(`/topic/${id}`)} className="btn-back">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Back to Topic
            </button>
            <div className="header-top">
              <h1>Edit Topic</h1>
            </div>
            <p className="create-topic-subtitle">
              Update your topic. Changes will be saved immediately.
            </p>
          </div>

          {error && (
            <div className="form-error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="form-success-message">
              {success}
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="create-topic-form">
              {/* Same form structure as CreateTopicPage */}
              <section className="form-section">
                <h2 className="form-section-title">Basic Information</h2>
                
                <div className="form-group">
                  <label htmlFor="title">
                    Title <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter topic title (max 500 characters)"
                    maxLength={500}
                    required
                  />
                  <span className="char-count">{formData.title.length}/500</span>
                </div>

                <div className="form-group">
                  <label htmlFor="description">
                    Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter a short description that will appear on topic cards and lists"
                    rows={4}
                    required
                  />
                  <span className="field-hint">This description will appear on topic cards and in search results.</span>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="category">
                      Category <span className="required">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tags">
                      Tags <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="AI, Innovation, Future (comma-separated)"
                      required
                    />
                    <span className="field-hint">Separate tags with commas (e.g., AI, Innovation, Future)</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="image">
                    Featured Image
                  </label>
                  <div className="image-upload-container">
                    <div className="image-upload-options">
                      <label className="image-upload-button">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          style={{ display: 'none' }}
                        />
                        {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      </label>
                      <span className="image-upload-or">or</span>
                      <input
                        type="url"
                        id="image"
                        name="image"
                        value={formData.image}
                        onChange={handleChange}
                        placeholder="Enter image URL"
                        className="image-url-input"
                      />
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="image-preview-container">
                        <img
                          src={imagePreview || formData.image}
                          alt="Preview"
                          className="image-preview"
                          onError={(e) => {
                            e.target.style.display = 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="btn-remove-image"
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="field-hint">Upload an image file (max 5MB) or enter an image URL</span>
                </div>
              </section>

              <section className="form-section">
                <h2 className="form-section-title">Article Content</h2>
                
                <div className="form-group">
                  <label htmlFor="abstract">
                    Abstract
                  </label>
                  <textarea
                    id="abstract"
                    name="abstract"
                    value={formData.abstract}
                    onChange={handleChange}
                    placeholder="Enter a comprehensive abstract (200-500 words recommended). This will appear at the top of the full article."
                    rows={6}
                  />
                  <span className="field-hint">A detailed abstract helps readers understand the full scope of your topic.</span>
                </div>

                <div className="form-group">
                  <div className="sections-header">
                    <label>Content Sections</label>
                    <button type="button" onClick={addSection} className="btn-add-section">
                      + Add Section
                    </button>
                  </div>
                  
                  {sections.map((section, sectionIndex) => (
                    <div key={section.id} className="content-section">
                      <div className="section-header">
                        <input
                          type="text"
                          placeholder="Section Title (e.g., Introduction, Methodology)"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          className="section-title-input"
                        />
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            className="btn-remove-section"
                          >
                            Remove Section
                          </button>
                        )}
                      </div>
                      
                      {section.paragraphs.map((paragraph, paraIndex) => (
                        <div key={paraIndex} className="paragraph-group">
                          <textarea
                            placeholder={`Paragraph ${paraIndex + 1}...`}
                            value={paragraph}
                            onChange={(e) => updateSectionParagraph(section.id, paraIndex, e.target.value)}
                            rows={4}
                            className="paragraph-input"
                          />
                          {section.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParagraph(section.id, paraIndex)}
                              className="btn-remove-paragraph"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => addParagraph(section.id)}
                        className="btn-add-paragraph"
                      >
                        + Add Paragraph
                      </button>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label htmlFor="references">
                    References
                  </label>
                  <textarea
                    id="references"
                    name="references"
                    value={formData.references}
                    onChange={handleChange}
                    placeholder="Enter references, one per line"
                    rows={6}
                  />
                  <span className="field-hint">Enter one reference per line. Each reference will be formatted as a separate item.</span>
                </div>

                <div className="form-group">
                  <label htmlFor="authorBio">
                    Author Bio
                  </label>
                  <textarea
                    id="authorBio"
                    name="authorBio"
                    value={formData.authorBio}
                    onChange={handleChange}
                    placeholder="Enter a brief biography about the author (optional)"
                    rows={4}
                  />
                  <span className="field-hint">A brief biography helps readers understand the author's background and expertise.</span>
                </div>
              </section>

              <section className="form-section">
                <h2 className="form-section-title">Metadata</h2>
                
                <div className="form-group">
                  <label htmlFor="readTime">
                    Read Time (minutes)
                  </label>
                  <input
                    type="number"
                    id="readTime"
                    name="readTime"
                    value={formData.readTime}
                    onChange={handleChange}
                    placeholder="Auto-calculated"
                    min="1"
                  />
                  <span className="field-hint">Estimated reading time in minutes. Leave empty to auto-calculate based on content length.</span>
                </div>
              </section>

              {/* Visualizations Section */}
              <section className="form-section">
                <h2 className="form-section-title">Visualizations (Optional)</h2>
                
                <div className="form-group">
                  <div className="sections-header">
                    <label>Charts & Graphs</label>
                    <button type="button" onClick={addVisualization} className="btn-add-section">
                      + Add Visualization
                    </button>
                  </div>
                  
                  {visualizations.map((viz, vizIndex) => (
                    <div key={viz.id} className="visualization-builder">
                      <div className="viz-header">
                        <input
                          type="text"
                          placeholder="Chart Title"
                          value={viz.title}
                          onChange={(e) => updateVisualization(viz.id, 'title', e.target.value)}
                          className="viz-title-input"
                        />
                        <select
                          value={viz.type}
                          onChange={(e) => updateVisualization(viz.id, 'type', e.target.value)}
                          className="viz-type-select"
                        >
                          <option value="bar">Bar Chart</option>
                          <option value="line">Line Chart</option>
                          <option value="pie">Pie Chart</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => removeVisualization(viz.id)}
                          className="btn-remove-section"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                          placeholder="Describe what this chart shows..."
                          value={viz.description}
                          onChange={(e) => updateVisualization(viz.id, 'description', e.target.value)}
                          rows={2}
                          className="paragraph-input"
                        />
                      </div>

                      <div className="form-group">
                        <label>Data</label>
                        <div className="data-rows">
                          {viz.dataRows.map((row, rowIndex) => (
                            <div key={rowIndex} className="data-row">
                              <input
                                type="text"
                                placeholder="Label (e.g., 2020, Category A)"
                                value={row.name}
                                onChange={(e) => updateDataRow(viz.id, rowIndex, 'name', e.target.value)}
                                className="data-input"
                              />
                              <input
                                type="number"
                                placeholder="Value"
                                value={row.value}
                                onChange={(e) => updateDataRow(viz.id, rowIndex, 'value', e.target.value)}
                                className="data-input"
                              />
                              {viz.dataRows.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeDataRow(viz.id, rowIndex)}
                                  className="btn-remove-paragraph"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addDataRow(viz.id)}
                            className="btn-add-paragraph"
                          >
                            + Add Data Point
                          </button>
                        </div>
                      </div>

                      {/* Live Preview */}
                      <div className="form-group">
                        <label>Live Preview</label>
                        <div className="viz-preview-container">
                          {(() => {
                            const previewViz = prepareSingleVisualization(viz)
                            if (previewViz && previewViz.data && previewViz.data.length > 0) {
                              return (
                                <Visualization
                                  type={previewViz.type}
                                  title={previewViz.title}
                                  data={previewViz.data}
                                  config={previewViz.config}
                                />
                              )
                            } else {
                              return (
                                <div className="viz-preview-placeholder">
                                  <p>Enter chart title and data above to see preview</p>
                                </div>
                              )
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  ))}

                  {visualizations.length === 0 && (
                    <p className="field-hint">Add charts and graphs to visualize your data. You can add bar charts, line charts, or pie charts.</p>
                  )}
                </div>
              </section>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className="btn-preview"
                >
                  {isPreview ? 'Edit' : 'Preview'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/topic/${id}`)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default EditTopicPage

