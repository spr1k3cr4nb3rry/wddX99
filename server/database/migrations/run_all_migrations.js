import pg from 'pg'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file - try server directory first, then root
dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config() // Also try default locations

const { Pool } = pg

// Use same connection pattern as database.js
// Support both DATABASE_URL and individual connection parameters
let poolConfig

if (process.env.DATABASE_URL) {
  // Use connection string if provided
  const isLocalhost = process.env.DATABASE_URL.includes('localhost') || 
                      process.env.DATABASE_URL.includes('127.0.0.1')
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
    ssl: isLocalhost ? false : { rejectUnauthorized: false }
  }
} else {
  // Use individual connection parameters (like database.js)
  const dbPassword = process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : undefined
  
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'wddx99',
    user: process.env.DB_USER || 'postgres',
    password: dbPassword,
    ssl: false // Localhost doesn't need SSL
  }
}

const pool = new Pool(poolConfig)

async function runMigration(fileName) {
  try {
    const filePath = join(__dirname, fileName)
    const sql = readFileSync(filePath, 'utf8')
    console.log(`Running migration: ${fileName}`)
    await pool.query(sql)
    console.log(`✓ Completed: ${fileName}`)
  } catch (error) {
    console.error(`✗ Error running ${fileName}:`, error.message)
    throw error
  }
}

async function main() {
  try {
    console.log('Starting database migrations...\n')
    
    await runMigration('create_enhanced_voting.sql')
    await runMigration('create_whitepapers.sql')
    
    console.log('\n✓ All migrations completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

