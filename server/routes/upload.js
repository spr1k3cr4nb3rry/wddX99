import express from 'express'
import upload from '../middleware/upload.js'
import { authenticateToken } from '../middleware/auth.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Upload image (requires authentication)
router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // Return the file path relative to the public directory
    // The file is stored in server/uploads/images, but we'll serve it from /uploads/images
    const filePath = `/uploads/images/${req.file.filename}`
    
    res.json({
      success: true,
      path: filePath,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

// Delete image (requires authentication)
router.delete('/image/:filename', authenticateToken, (req, res) => {
  try {
    const { filename } = req.params
    const filePath = path.join(__dirname, '..', 'uploads', 'images', filename)

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }

    // Delete file
    fs.unlinkSync(filePath)
    
    res.json({ success: true, message: 'Image deleted successfully' })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({ error: 'Failed to delete image' })
  }
})

export default router

