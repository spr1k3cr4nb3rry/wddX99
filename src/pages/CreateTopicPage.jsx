import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { topicsAPI, uploadAPI } from '../services/api'
import ChartBuilder from '../components/topic/ChartBuilder/ChartBuilder'
import Visualization from '../components/topic/Visualization/Visualization'
import ExportMenu from '../components/topic/ExportMenu/ExportMenu'
import ShareButtons from '../components/topic/ShareButtons/ShareButtons'
import { InfoBox, CodeBlock, ImageGallery } from '../components/topic/ContentBlocks'
import './CreateTopicPage.css'

function CreateTopicPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState('') // 'saving', 'saved', ''
  const autoSaveIntervalRef = useRef(null)
  const lastSaveRef = useRef(null)
  const draftTopicIdRef = useRef(null) // Track the draft topic ID to prevent duplicates
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    image: '',
    abstract: '',
    authorBio: '',
    references: ''
  })

  // Customization settings
  const [customization, setCustomization] = useState({
    typography: {
      fontSize: 'medium', // small, medium, large, xlarge
      lineHeight: 'normal', // tight, normal, relaxed
      fontFamily: 'serif', // serif, sans-serif, monospace
      textWidth: 'medium' // narrow, medium, wide, full
    },
    layout: 'classic', // classic, magazine, blog
    colorScheme: 'academic-blue' // Professional color scheme (fixed)
  })

  const [sections, setSections] = useState([
    { id: 1, title: '', paragraphs: [''] }
  ])

  const [visualizations, setVisualizations] = useState([])
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  
  // Content blocks (pull quotes, CTA boxes, info boxes, code blocks, image galleries)
  const [contentBlocks, setContentBlocks] = useState([])

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('topicDraft')
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft)
        const loadedFormData = draft.formData || formData
        setFormData(loadedFormData)
        setSections(draft.sections || sections)
        setVisualizations(draft.visualizations || [])
        setContentBlocks(draft.contentBlocks || [])
        setCustomization(draft.customization || customization)
        // Set image preview if image exists
        if (loadedFormData.image) {
          setImagePreview(loadedFormData.image)
        }
        lastSaveRef.current = draft.timestamp
      } catch (err) {
        console.error('Failed to load draft:', err)
      }
    }
  }, [])

  // Auto-save to localStorage every 30 seconds
  useEffect(() => {
    const saveToLocalStorage = () => {
      const draft = {
        formData,
        sections,
        visualizations,
        contentBlocks,
        customization,
        timestamp: Date.now()
      }
      localStorage.setItem('topicDraft', JSON.stringify(draft))
      lastSaveRef.current = Date.now()
    }

    // Save immediately when form data changes
    const timeoutId = setTimeout(() => {
      if (formData.title || formData.description || sections.some(s => s.title || s.paragraphs.some(p => p)) || visualizations.length > 0 || contentBlocks.length > 0) {
        saveToLocalStorage()
      }
    }, 2000) // Debounce: save 2 seconds after last change

    return () => clearTimeout(timeoutId)
  }, [formData, sections, visualizations, contentBlocks, customization])

  // Auto-save to server every 30 seconds (if form is valid)
  // REMOVED: Auto-save was creating duplicate topics. Only save manually now.
  // Auto-save to localStorage is still active (every 2 seconds)

  // Clear draft when successfully submitted
  useEffect(() => {
    if (success) {
      localStorage.removeItem('topicDraft')
      draftTopicIdRef.current = null // Reset draft ID
    }
  }, [success])

  // Scroll to top when preview is opened
  useEffect(() => {
    if (isPreview) {
      window.scrollTo({ top: 0, behavior: 'auto' })
    }
  }, [isPreview])

  // Check if user is logged in
  if (!user) {
    return (
      <div className="create-topic-page">
        <Header />
        <main className="create-topic-main">
          <div className="create-topic-container">
            <div className="access-denied">
              <h2>Login Required</h2>
              <p>Please login to create a topic.</p>
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

  const isAdmin = user?.role === 'admin'
  const categories = ['Technology', 'Education', 'Career Development', 'Learning', 'Research']

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
    // Clear errors when user types
    if (error) setError('')
  }

  const handleImageUpload = async (file) => {
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

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) handleImageUpload(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0])
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

  const validateForm = (silent = false) => {
    if (!formData.title.trim()) {
      if (!silent) setError('Title is required')
      return false
    }
    if (formData.title.length > 500) {
      if (!silent) setError('Title must be 500 characters or less')
      return false
    }
    if (!formData.description.trim()) {
      if (!silent) setError('Description is required')
      return false
    }
    if (!formData.category) {
      if (!silent) setError('Category is required')
      return false
    }
    if (!formData.tags.trim()) {
      if (!silent) setError('At least one tag is required')
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
        const newRows = [...v.dataRows]
        newRows[rowIndex] = { ...newRows[rowIndex], [field]: value }
        return { ...v, dataRows: newRows }
      }
      return v
    }))
  }

  // Content Blocks Management
  const addContentBlock = (type) => {
    const newId = contentBlocks.length > 0 ? Math.max(...contentBlocks.map(b => b.id)) + 1 : 1
    const baseBlock = {
      id: newId,
      type,
      position: 'after-section' // after-section, before-section, inline
    }

    switch (type) {
      case 'infoBox':
        setContentBlocks([...contentBlocks, { ...baseBlock, type: 'infoBox', boxType: 'info', title: '', content: '' }])
        break
      case 'codeBlock':
        setContentBlocks([...contentBlocks, { ...baseBlock, code: '', language: 'javascript', showLineNumbers: false }])
        break
      case 'imageGallery':
        setContentBlocks([...contentBlocks, { ...baseBlock, images: [''], captions: [''], layout: 'grid' }])
        break
      default:
        break
    }
  }

  const removeContentBlock = (blockId) => {
    setContentBlocks(contentBlocks.filter(b => b.id !== blockId))
  }

  const updateContentBlock = (blockId, field, value) => {
    setContentBlocks(contentBlocks.map(b => 
      b.id === blockId ? { ...b, [field]: value } : b
    ))
  }

  const updateBlockPosition = (blockId, position) => {
    setContentBlocks(contentBlocks.map(b => 
      b.id === blockId ? { ...b, position } : b
    ))
  }

  const updateContentBlockArray = (blockId, arrayField, index, value) => {
    setContentBlocks(contentBlocks.map(b => {
      if (b.id === blockId) {
        const newArray = [...b[arrayField]]
        newArray[index] = value
        return { ...b, [arrayField]: newArray }
      }
      return b
    }))
  }

  const addGalleryImage = (blockId) => {
    setContentBlocks(contentBlocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          images: [...b.images, ''],
          captions: [...b.captions, '']
        }
      }
      return b
    }))
  }

  const removeGalleryImage = (blockId, index) => {
    setContentBlocks(contentBlocks.map(b => {
      if (b.id === blockId && b.images.length > 1) {
        return {
          ...b,
          images: b.images.filter((_, i) => i !== index),
          captions: b.captions.filter((_, i) => i !== index)
        }
      }
      return b
    }))
  }

  // Calculate read time (average reading speed: 200 words per minute)
  const calculateReadTime = () => {
    let wordCount = 0
    
    // Count words in title
    if (formData.title) wordCount += formData.title.split(/\s+/).length
    
    // Count words in description
    if (formData.description) wordCount += formData.description.split(/\s+/).length
    
    // Count words in abstract
    if (formData.abstract) wordCount += formData.abstract.split(/\s+/).length
    
    // Count words in sections
    sections.forEach(section => {
      section.paragraphs.forEach(para => {
        if (para.trim()) wordCount += para.split(/\s+/).length
      })
    })
    
    // Count words in author bio
    if (formData.authorBio) wordCount += formData.authorBio.split(/\s+/).length
    
    // Calculate minutes (round up)
    const minutes = Math.ceil(wordCount / 200)
    return minutes || 1
  }

  // Generate table of contents from sections
  const generateTableOfContents = () => {
    const toc = []
    
    // Add Introduction if abstract exists
    if (formData.abstract) {
      toc.push({ id: 'abstract', title: 'Introduction' })
    }
    
    // Add sections
    sections
      .filter(s => s.title.trim())
      .forEach(section => {
        const id = section.title.toLowerCase().replace(/\s+/g, '-')
        toc.push({ id, title: section.title })
      })
    
    // Add standard sections that might exist
    const standardSections = [
      'Background and Context',
      'Research Methodology',
      'Key Findings',
      'Analysis and Discussion',
      'Implications for Education',
      'Conclusion'
    ]
    
    standardSections.forEach(title => {
      const exists = sections.some(s => s.title.trim().toLowerCase() === title.toLowerCase())
      if (!exists) {
        toc.push({ id: title.toLowerCase().replace(/\s+/g, '-'), title, placeholder: true })
      }
    })
    
    return toc
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Create mock topic object for ExportMenu and ShareButtons
  const getPreviewTopic = () => {
    return {
      id: 'preview',
      title: formData.title || 'Untitled Topic',
      description: formData.description || '',
      category: formData.category || '',
      abstract: formData.abstract || '',
      content: {
        sections: sections
          .filter(s => s.title.trim() || s.paragraphs.some(p => p.trim()))
          .map(s => ({
            id: s.title.toLowerCase().replace(/\s+/g, '-') || `section-${s.id}`,
            title: s.title.trim() || 'Untitled Section',
            content: s.paragraphs.filter(p => p.trim())
          })),
        references: (formData.references || '')
          .split('\n')
          .map(ref => ref.trim())
          .filter(ref => ref)
      },
      readTime: calculateReadTime(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        methodology: 'Mixed Methods',
        sampleSize: '10,000 students, 500 educators'
      }
    }
  }

  const prepareVisualizations = () => {
    if (!visualizations || !Array.isArray(visualizations)) return []
    
    return visualizations
      .filter(v => v && v.title && v.title.trim() && v.dataRows && Array.isArray(v.dataRows) && v.dataRows.some(r => r && r.name && r.name.trim() && r.value && r.value.trim()))
      .map(v => {
        try {
          // Convert dataRows to proper data format
          const data = (v.dataRows || [])
            .filter(r => r && r.name && r.name.trim() && r.value && r.value.trim())
            .map(r => {
              const obj = { name: r.name.trim() }
              // For bar/line charts, add value as a numeric field
              if (v.type === 'bar' || v.type === 'line') {
                obj[v.dataKey || 'value'] = parseFloat(r.value) || 0
              } else if (v.type === 'pie') {
                obj.value = parseFloat(r.value) || 0
              }
              return obj
            })

          const config = {
            xKey: v.xKey || 'name',
            description: v.description || null
          }

          if (v.type === 'bar') {
            config.bars = [{ dataKey: v.dataKey || 'value', name: v.dataKey || 'value' }]
          } else if (v.type === 'line') {
            config.lines = [{ dataKey: v.dataKey || 'value', name: v.dataKey || 'value' }]
          } else if (v.type === 'pie') {
            config.dataKey = 'value'
            config.nameKey = 'name'
          }

          return {
            type: v.type,
            title: v.title.trim(),
            data,
            config
          }
        } catch (error) {
          console.error('Error preparing visualization:', error, v)
          return null
        }
      })
      .filter(v => v !== null && v.data && v.data.length > 0)
  }

  const prepareTopicData = () => {
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    
    // Prepare content sections
    const contentSections = sections
      .filter(s => s.title.trim() || s.paragraphs.some(p => p.trim()))
      .map(s => ({
        id: s.title.toLowerCase().replace(/\s+/g, '-') || `section-${s.id}`,
        title: s.title.trim() || 'Untitled Section',
        content: s.paragraphs.filter(p => p.trim())
      }))
      .filter(s => s.content.length > 0)

    // Prepare references array
    const referencesArray = formData.references
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
      authorBio: formData.authorBio || null,
      content: {
        sections: contentSections,
        references: referencesArray
      },
      visualizations: visualizationsArray,
      contentBlocks: contentBlocks.filter(b => {
        // Filter out empty blocks
        if (b.type === 'infoBox' && !b.content) return false
        if (b.type === 'codeBlock' && !b.code) return false
        if (b.type === 'imageGallery' && (!b.images || b.images.every(img => !img))) return false
        return true
      }),
      customizationSettings: customization
    }
  }

  const handleSaveDraft = async () => {
    if (!validateForm()) return

    setLoading(true)
    setError('')
    
    try {
      const topicData = {
        ...prepareTopicData(),
        status: 'draft'
      }

      // If we have a draft topic ID, update it instead of creating a new one
      if (draftTopicIdRef.current) {
        await topicsAPI.update(draftTopicIdRef.current, topicData)
        setSuccess('Draft updated successfully!')
      } else {
        const result = await topicsAPI.create(topicData)
        draftTopicIdRef.current = result.id // Store the ID to prevent duplicates
        setSuccess('Draft saved successfully!')
      }
      
      setTimeout(() => {
        navigate('/topics')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to save draft. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError('')
    
    try {
      const topicData = {
        ...prepareTopicData(),
        status: isAdmin ? 'published' : 'pending'
      }

      // If we have a draft topic ID, update it instead of creating a new one
      if (draftTopicIdRef.current) {
        await topicsAPI.update(draftTopicIdRef.current, topicData)
        setSuccess(isAdmin ? 'Topic published successfully!' : 'Topic submitted for review!')
      } else {
        await topicsAPI.create(topicData)
        setSuccess(isAdmin ? 'Topic published successfully!' : 'Topic submitted for review!')
      }
      
      setTimeout(() => {
        navigate('/topics')
      }, 1500)
    } catch (err) {
      setError(err.message || 'Failed to submit topic. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-topic-page">
      <Header />
      <main className={isPreview ? "preview-main" : "create-topic-main"}>
        <div className={isPreview ? "preview-wrapper" : "create-topic-container"}>
          {!isPreview && (
            <div className="create-topic-header">
              <button onClick={() => navigate('/topics')} className="btn-back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Topics
              </button>
              <div className="header-top">
                <h1>Create New Topic</h1>
                <div className="save-status">
                  {saveStatus === 'saving' && (
                    <span className="save-indicator saving">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      Auto-saving...
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="save-indicator saved">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Draft saved
                    </span>
                  )}
                  {lastSaveRef.current && !saveStatus && (
                    <span className="save-indicator">
                      Last saved: {new Date(lastSaveRef.current).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
              <p className="create-topic-subtitle">
                {isAdmin 
                  ? 'Create and publish a new topic. Your topic will be published immediately.'
                  : 'Create a new topic. Your topic will be submitted for admin review before being published.'}
              </p>
            </div>
          )}

          {!isPreview && error && (
            <div className="form-error-message">
              {error}
            </div>
          )}

          {!isPreview && success && (
            <div className="form-success-message">
              {success}
            </div>
          )}

          {isPreview ? (
            <div className="preview-container" data-color-scheme={customization.colorScheme}>
              <div className="preview-detail-container">
                <button
                  type="button"
                  onClick={() => setIsPreview(false)}
                  className="btn-back"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to Edit
                </button>
                <div className="preview-layout">
                  <div className="preview-content">
                  <article 
                    className={`preview-article preview-layout-${customization.layout}`}
                    style={{
                      fontSize: customization.typography.fontSize === 'small' ? '14px' : 
                                customization.typography.fontSize === 'medium' ? '16px' :
                                customization.typography.fontSize === 'large' ? '18px' : '20px',
                      lineHeight: customization.typography.lineHeight === 'tight' ? '1.5' :
                                 customization.typography.lineHeight === 'normal' ? '1.7' : '1.9',
                      fontFamily: customization.typography.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                                 customization.typography.fontFamily === 'sans-serif' ? 'Inter, system-ui, sans-serif' :
                                 '"Courier New", Courier, monospace',
                      width: '100%',
                      maxWidth: '100%'
                    }}
                  >
                    <h1 className="preview-title">{formData.title || 'Untitled Topic'}</h1>
                    
                    {formData.image && (
                      <div className="preview-image-container">
                        <img src={formData.image} alt={formData.title} className="preview-image" />
                      </div>
                    )}

                    {formData.abstract && (
                      <div className="preview-abstract" id="abstract">
                        <h2 className="preview-section-title">Abstract</h2>
                        <p className="preview-abstract-text">{formData.abstract}</p>
                      </div>
                    )}

                    {(sections || [])
                      .filter(s => s && (s.title && s.title.trim() || (s.paragraphs && Array.isArray(s.paragraphs) && s.paragraphs.some(p => p && p.trim()))))
                      .map((section, index) => {
                        try {
                          const sectionId = section.title && section.title.trim() 
                            ? section.title.toLowerCase().replace(/\s+/g, '-')
                            : `section-${section.id || index}`
                          return (
                            <div key={section.id || index} className="preview-section" id={sectionId}>
                              {section.title && section.title.trim() && (
                                <h2 className="preview-section-title">{section.title}</h2>
                              )}
                              {(section.paragraphs || [])
                                .filter(p => p && p.trim())
                                .map((paragraph, pIndex) => (
                                  <p key={pIndex} className="preview-paragraph">{paragraph}</p>
                                ))}
                              
                              {/* Render content blocks after each section */}
                              {(contentBlocks || [])
                                .filter(b => b && (b.position === 'after-section' || (!b.position && index === sections.length - 1)))
                                .map((block) => {
                                  try {
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
                                  } catch (error) {
                                    console.error('Error rendering content block:', error, block)
                                    return null
                                  }
                                })}
                            </div>
                          )
                        } catch (error) {
                          console.error('Error rendering section:', error, section)
                          return null
                        }
                      })}
                    
                    {/* Render content blocks that should appear after all sections */}
                    {(contentBlocks || [])
                      .filter(b => b && (b.position === 'after-all' || (!b.position && sections.length === 0)))
                      .map((block) => {
                        try {
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
                        } catch (error) {
                          console.error('Error rendering content block:', error, block)
                          return null
                        }
                      })}

                    {formData.references && formData.references.trim() && (
                      <div className="preview-references">
                        <h2 className="preview-section-title">References</h2>
                        <ol className="preview-references-list">
                          {formData.references
                            .split('\n')
                            .filter(ref => ref.trim())
                            .map((ref, index) => (
                              <li key={index} className="preview-reference-item">{ref.trim()}</li>
                            ))}
                        </ol>
                      </div>
                    )}

                    {formData.authorBio && formData.authorBio.trim() && (
                      <div className="preview-author-bio">
                        <h2 className="preview-section-title">About the Author</h2>
                        <p className="preview-author-bio-text">{formData.authorBio}</p>
                      </div>
                    )}

                    {visualizations.length > 0 && (
                      <div className="preview-visualizations">
                        <h2 className="preview-section-title">Data & Visualizations</h2>
                        {prepareVisualizations().map((viz, index) => (
                          <div key={index} className="preview-viz-container">
                            <Visualization
                              type={viz.type}
                              title={viz.title}
                              data={viz.data}
                              config={viz.config}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                </div>

                <aside className="preview-sidebar">
                  {/* Table of Contents */}
                  <div className="preview-sidebar-section">
                    <h3 className="preview-sidebar-title">Table of Contents</h3>
                    <nav className="preview-toc">
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {generateTableOfContents().map((item, index) => (
                          <li key={index} style={{ marginBottom: '0.5rem' }}>
                            <a
                              href={`#${item.id}`}
                              className={`preview-toc-link ${item.placeholder ? 'preview-toc-placeholder' : ''}`}
                              onClick={(e) => {
                                e.preventDefault()
                                const element = document.getElementById(item.id)
                                if (element) {
                                  const offset = 100
                                  const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
                                  const offsetPosition = elementPosition - offset
                                  window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                  })
                                }
                              }}
                            >
                              {item.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </nav>
                  </div>

                  {/* Article Details */}
                  <div className="preview-sidebar-section">
                    <h3 className="preview-sidebar-title">Article Details</h3>
                    <dl className="preview-article-details">
                      <div className="preview-detail-item">
                        <dt className="preview-detail-label">Published</dt>
                        <dd className="preview-detail-value">{formatDate(new Date())}</dd>
                      </div>
                      <div className="preview-detail-item">
                        <dt className="preview-detail-label">Last Updated</dt>
                        <dd className="preview-detail-value">{formatDate(new Date())}</dd>
                      </div>
                      <div className="preview-detail-item">
                        <dt className="preview-detail-label">Category</dt>
                        <dd className="preview-detail-value">{formData.category || 'Uncategorized'}</dd>
                      </div>
                      <div className="preview-detail-item">
                        <dt className="preview-detail-label">Read Time</dt>
                        <dd className="preview-detail-value">{calculateReadTime()} min</dd>
                      </div>
                      <div className="preview-detail-item">
                        <dt className="preview-detail-label">Methodology</dt>
                        <dd className="preview-detail-value">Mixed Methods</dd>
                      </div>
                      <div className="preview-detail-item">
                        <dt className="preview-detail-label">Sample Size</dt>
                        <dd className="preview-detail-value">10,000 students, 500 educators</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Action Buttons */}
                  <div className="preview-sidebar-section">
                    <div className="preview-actions">
                      <ExportMenu topic={getPreviewTopic()} />
                      <ShareButtons title={formData.title || 'Untitled Topic'} url={typeof window !== 'undefined' ? window.location.href : ''} />
                    </div>
                  </div>

                  {/* Related Topics */}
                  <div className="preview-sidebar-section">
                    <h3 className="preview-sidebar-title">Related Topics</h3>
                    <div className="preview-related-topics">
                      <p className="preview-todo">(To Do)</p>
                    </div>
                  </div>
                </aside>
                </div>
              </div>
            </div>
          ) : (
            <div className="editor-layout">
              {/* Sidebar for settings */}
              <aside className="editor-sidebar">
                <div className="sidebar-section">
                  <h3 className="sidebar-title">Actions</h3>
                  <button
                    type="button"
                    onClick={() => setIsPreview(true)}
                    className="btn-preview-sidebar"
                  >
                    👁️ Preview
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={loading}
                    className="btn-save-draft-sidebar"
                  >
                    💾 Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="btn-publish-sidebar"
                  >
                    {loading ? 'Publishing...' : isAdmin ? '📤 Publish' : '📤 Submit'}
                  </button>
                </div>

                <div className="sidebar-section">
                  <h3 className="sidebar-title">Article Info</h3>
                  <div className="sidebar-form-group">
                    <label>Category</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sidebar-form-group">
                    <label>Tags</label>
                    <input
                      type="text"
                      id="tags"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="AI, Innovation, Future"
                      required
                    />
                  </div>
                </div>

                <div className="sidebar-section">
                  <h3 className="sidebar-title">Customization</h3>
                  <div className="sidebar-form-group">
                    <label>Layout</label>
                    <select
                      value={customization.layout}
                      onChange={(e) => setCustomization({ ...customization, layout: e.target.value })}
                    >
                      <option value="classic">Classic</option>
                      <option value="magazine">Magazine</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>
                  <div className="sidebar-form-group">
                    <label>Font Size</label>
                    <select
                      value={customization.typography.fontSize}
                      onChange={(e) => setCustomization({
                        ...customization,
                        typography: { ...customization.typography, fontSize: e.target.value }
                      })}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                      <option value="xlarge">Extra Large</option>
                    </select>
                  </div>
                  <div className="sidebar-form-group">
                    <label>Font Family</label>
                    <select
                      value={customization.typography.fontFamily}
                      onChange={(e) => setCustomization({
                        ...customization,
                        typography: { ...customization.typography, fontFamily: e.target.value }
                      })}
                    >
                      <option value="serif">Serif</option>
                      <option value="sans-serif">Sans-serif</option>
                      <option value="monospace">Monospace</option>
                    </select>
                  </div>
                  <div className="sidebar-form-group">
                    <label>Text Width</label>
                    <select
                      value={customization.typography.textWidth}
                      onChange={(e) => setCustomization({
                        ...customization,
                        typography: { ...customization.typography, textWidth: e.target.value }
                      })}
                    >
                      <option value="narrow">Narrow</option>
                      <option value="medium">Medium</option>
                      <option value="wide">Wide</option>
                      <option value="full">Full</option>
                    </select>
                  </div>
                </div>
              </aside>

              {/* Main editing area - looks like preview */}
              <form onSubmit={handleSubmit} className="editor-main">
                <div className="editor-toolbar">
                  <button type="button" onClick={() => navigate('/topics')} className="btn-back-toolbar">
                    ← Back
                  </button>
                  <div className="toolbar-spacer"></div>
                  <div className="toolbar-actions">
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className="btn-toolbar"
                    >
                      👁️ Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      disabled={loading}
                      className="btn-toolbar"
                    >
                      💾 Save Draft
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-toolbar btn-toolbar-primary"
                    >
                      {loading ? 'Publishing...' : isAdmin ? '📤 Publish' : '📤 Submit'}
                    </button>
                    {saveStatus && (
                      <span className={`save-status-small ${saveStatus}`}>
                        {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
                      </span>
                    )}
                  </div>
                </div>

                <article className="editor-article">
                  {/* Title - large, prominent */}
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Article Title"
                    className="editor-title-input"
                    maxLength={500}
                    required
                  />
                  
                  {/* Description */}
                  <div className="editor-description">
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Brief description that appears on topic cards..."
                      className="editor-description-input"
                      rows={2}
                      required
                    />
                  </div>

                  {/* Featured Image */}
                  <div className="editor-image-section">
                    <div 
                      className={`editor-image-upload ${dragActive ? 'drag-active' : ''}`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {formData.image || imagePreview ? (
                        <div className="editor-image-preview">
                          <img src={imagePreview || formData.image} alt="Preview" onError={(e) => e.target.style.display = 'none'} />
                          <button type="button" onClick={handleRemoveImage} className="btn-remove-image-small">×</button>
                        </div>
                      ) : (
                        <div className="editor-image-placeholder">
                          <label className="editor-image-upload-btn">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileInput}
                              disabled={uploadingImage}
                              style={{ display: 'none' }}
                            />
                            {uploadingImage ? 'Uploading...' : '📷 Add Featured Image'}
                          </label>
                          <span>or drag & drop</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Abstract */}
                  {formData.abstract ? (
                    <div className="editor-abstract">
                      <label className="editor-label">Abstract</label>
                      <textarea
                        id="abstract"
                        name="abstract"
                        value={formData.abstract}
                        onChange={handleChange}
                        placeholder="Enter abstract..."
                        className="editor-textarea"
                        rows={4}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, abstract: ' ' })}
                      className="btn-add-abstract"
                    >
                      + Add Abstract
                    </button>
                  )}

                  {/* Sections */}
                  {sections.map((section, sectionIndex) => (
                    <div key={section.id} className="editor-section">
                      <div className="editor-section-header">
                        <div className="section-controls">
                          {sections.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => moveSection(section.id, 'up')}
                                disabled={sectionIndex === 0}
                                className="btn-move-section"
                                title="Move up"
                              >
                                ↑
                              </button>
                              <button
                                type="button"
                                onClick={() => moveSection(section.id, 'down')}
                                disabled={sectionIndex === sections.length - 1}
                                className="btn-move-section"
                                title="Move down"
                              >
                                ↓
                              </button>
                            </>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Section Title"
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          className="editor-section-title-input"
                        />
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(section.id)}
                            className="btn-remove-section-small"
                            title="Remove"
                          >
                            ×
                          </button>
                        )}
                      </div>
                      
                      {section.paragraphs.map((paragraph, paraIndex) => (
                        <div key={paraIndex} className="editor-paragraph">
                          <textarea
                            placeholder="Write your content here..."
                            value={paragraph}
                            onChange={(e) => updateSectionParagraph(section.id, paraIndex, e.target.value)}
                            rows={6}
                            className="editor-paragraph-textarea"
                          />
                          {section.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeParagraph(section.id, paraIndex)}
                              className="btn-remove-paragraph-small"
                            >
                              Remove paragraph
                            </button>
                          )}
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => addParagraph(section.id)}
                        className="btn-add-paragraph-inline"
                      >
                        + Add Paragraph
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addSection}
                    className="btn-add-section-inline"
                  >
                    + Add Section
                  </button>

                  {/* References */}
                  {formData.references ? (
                    <div className="editor-references">
                      <label className="editor-label">References</label>
                      <textarea
                        id="references"
                        name="references"
                        value={formData.references}
                        onChange={handleChange}
                        placeholder="Enter references, one per line..."
                        className="editor-textarea"
                        rows={6}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, references: ' ' })}
                      className="btn-add-abstract"
                    >
                      + Add References
                    </button>
                  )}

                  {/* Author Bio */}
                  {formData.authorBio ? (
                    <div className="editor-author-bio">
                      <label className="editor-label">Author Bio</label>
                      <textarea
                        id="authorBio"
                        name="authorBio"
                        value={formData.authorBio}
                        onChange={handleChange}
                        placeholder="Enter author biography..."
                        className="editor-textarea"
                        rows={4}
                      />
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, authorBio: ' ' })}
                      className="btn-add-abstract"
                    >
                      + Add Author Bio
                    </button>
                  )}

                  {/* Content Blocks */}
                  {contentBlocks.length > 0 && (
                    <div className="editor-content-blocks">
                      {contentBlocks.map((block, blockIndex) => (
                        <div key={block.id} className="content-block-inline">
                          <div className="content-block-inline-header">
                            <span className="content-block-inline-title">
                              {block.type === 'infoBox' && 'ℹ️ Info Box'}
                              {block.type === 'codeBlock' && '💻 Code Block'}
                              {block.type === 'imageGallery' && '🖼️ Image Gallery'}
                            </span>
                            <div className="block-position-controls">
                              <select
                                value={block.position || 'after-section'}
                                onChange={(e) => updateBlockPosition(block.id, e.target.value)}
                                className="block-position-select"
                              >
                                <option value="before-section">Before Section</option>
                                <option value="after-section">After Section</option>
                                <option value="after-all">After All</option>
                              </select>
                              <button
                                type="button"
                                onClick={() => removeContentBlock(block.id)}
                                className="btn-remove-block"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="block-editor-content-inline">
                            {block.type === 'infoBox' && (
                              <div className="block-editor-content">
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>Box Type</label>
                                    <select
                                      value={block.boxType || 'info'}
                                      onChange={(e) => updateContentBlock(block.id, 'boxType', e.target.value)}
                                    >
                                      <option value="info">Info</option>
                                      <option value="tip">Tip</option>
                                      <option value="warning">Warning</option>
                                      <option value="important">Important</option>
                                      <option value="success">Success</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>Title (Optional)</label>
                                    <input
                                      type="text"
                                      value={block.title || ''}
                                      onChange={(e) => updateContentBlock(block.id, 'title', e.target.value)}
                                      placeholder="Box title"
                                    />
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label>Content</label>
                                  <textarea
                                    value={block.content || ''}
                                    onChange={(e) => updateContentBlock(block.id, 'content', e.target.value)}
                                    placeholder="Enter the information..."
                                    rows={4}
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'codeBlock' && (
                              <div className="block-editor-content">
                                <div className="form-row">
                                  <div className="form-group">
                                    <label>Language</label>
                                    <select
                                      value={block.language || 'javascript'}
                                      onChange={(e) => updateContentBlock(block.id, 'language', e.target.value)}
                                    >
                                      <option value="javascript">JavaScript</option>
                                      <option value="typescript">TypeScript</option>
                                      <option value="python">Python</option>
                                      <option value="java">Java</option>
                                      <option value="html">HTML</option>
                                      <option value="css">CSS</option>
                                      <option value="sql">SQL</option>
                                      <option value="json">JSON</option>
                                      <option value="text">Plain Text</option>
                                    </select>
                                  </div>
                                  <div className="form-group">
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={block.showLineNumbers || false}
                                        onChange={(e) => updateContentBlock(block.id, 'showLineNumbers', e.target.checked)}
                                      />
                                      Show Line Numbers
                                    </label>
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label>Code</label>
                                  <textarea
                                    value={block.code || ''}
                                    onChange={(e) => updateContentBlock(block.id, 'code', e.target.value)}
                                    placeholder="Enter your code..."
                                    rows={10}
                                    style={{ fontFamily: 'monospace' }}
                                  />
                                </div>
                              </div>
                            )}

                            {block.type === 'imageGallery' && (
                              <div className="block-editor-content">
                                <div className="form-group">
                                  <label>Layout</label>
                                  <select
                                    value={block.layout || 'grid'}
                                    onChange={(e) => updateContentBlock(block.id, 'layout', e.target.value)}
                                  >
                                    <option value="grid">Grid</option>
                                    <option value="carousel">Carousel</option>
                                    <option value="masonry">Masonry</option>
                                  </select>
                                </div>
                                {block.images && block.images.map((image, index) => (
                                  <div key={index} className="gallery-item-editor">
                                    <div className="form-row">
                                      <div className="form-group gallery-image-upload">
                                        <label>Image {index + 1}</label>
                                        <div className="gallery-upload-options">
                                          <label className="gallery-upload-button">
                                            <input
                                              type="file"
                                              accept="image/*"
                                              onChange={(e) => {
                                                const file = e.target.files[0]
                                                if (file) handleGalleryImageUpload(block.id, index, file)
                                              }}
                                              disabled={uploadingImage}
                                              style={{ display: 'none' }}
                                            />
                                            {uploadingImage ? 'Uploading...' : '📤 Upload'}
                                          </label>
                                          <span className="gallery-upload-or">or</span>
                                          <input
                                            type="url"
                                            value={image}
                                            onChange={(e) => updateContentBlockArray(block.id, 'images', index, e.target.value)}
                                            placeholder="Enter image URL"
                                            className="gallery-url-input"
                                          />
                                        </div>
                                        {image && (
                                          <div className="gallery-image-preview">
                                            <img src={image} alt={`Gallery ${index + 1}`} onError={(e) => e.target.style.display = 'none'} />
                                          </div>
                                        )}
                                      </div>
                                      <div className="form-group">
                                        <label>Caption (Optional)</label>
                                        <input
                                          type="text"
                                          value={block.captions?.[index] || ''}
                                          onChange={(e) => {
                                            const newCaptions = [...(block.captions || [])]
                                            newCaptions[index] = e.target.value
                                            updateContentBlock(block.id, 'captions', newCaptions)
                                          }}
                                          placeholder="Image caption"
                                        />
                                      </div>
                                      {block.images.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => removeGalleryImage(block.id, index)}
                                          className="btn-remove-gallery-item"
                                        >
                                          Remove
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addGalleryImage(block.id)}
                                  className="btn-add-gallery-item"
                                >
                                  + Add Image
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
              </div>
                  )}

                  {/* Add Content Blocks */}
                  <div className="editor-add-blocks">
                    <button type="button" onClick={() => addContentBlock('infoBox')} className="btn-add-block-inline">+ Info Box</button>
                    <button type="button" onClick={() => addContentBlock('codeBlock')} className="btn-add-block-inline">+ Code Block</button>
                    <button type="button" onClick={() => addContentBlock('imageGallery')} className="btn-add-block-inline">+ Image Gallery</button>
                  </div>

                  {/* Visualizations */}
                  {visualizations.length > 0 && (
                    <div className="editor-visualizations">
                      {visualizations.map((viz, vizIndex) => (
                        <ChartBuilder
                          key={viz.id}
                          visualization={viz}
                          onUpdate={updateVisualization}
                          onRemove={removeVisualization}
                        />
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addVisualization}
                    className="btn-add-visualization-inline"
                  >
                    + Add Visualization
                  </button>
                </article>
              </form>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default CreateTopicPage

