import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file from server directory
dotenv.config({ path: join(__dirname, '..', '.env') })

// Ensure password is a string
const dbPassword = process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : undefined

if (!dbPassword) {
  console.error('ERROR: DB_PASSWORD is not set in .env file')
  console.error('Please create a .env file in the server directory with your database password')
}

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'wddx99',
  user: process.env.DB_USER || 'postgres',
  password: dbPassword,
})

// Test database connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})

export default pool

