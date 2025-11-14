// Script to create notifications table
import pg from 'pg'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const { Pool } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wddx99',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
})

async function runMigration() {
  try {
    console.log('Creating notifications table...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'create_notifications_table.sql')
    const sql = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the SQL
    await pool.query(sql)
    
    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()

