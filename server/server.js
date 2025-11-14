import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import topicRoutes from './routes/topics.js'
import userRoutes from './routes/users.js'
import uploadRoutes from './routes/upload.js'
import commentRoutes from './routes/comments.js'
import searchRoutes from './routes/search.js'
import notificationRoutes from './routes/notifications.js'
import analyticsRoutes from './routes/analytics.js'
import bookmarkRoutes from './routes/bookmarks.js'
import votingRoutes from './routes/voting.js'
import surveyRoutes from './routes/surveys.js'
import researchProposalRoutes from './routes/research-proposals.js'
import whitepaperRoutes from './routes/whitepapers.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/topics', topicRoutes)
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/voting', votingRoutes)
app.use('/api/surveys', surveyRoutes)
app.use('/api/research-proposals', researchProposalRoutes)
app.use('/api/whitepapers', whitepaperRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

