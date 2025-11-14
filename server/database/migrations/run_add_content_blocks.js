// Script to add content_blocks column to topics table
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wddx99',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
})

async function runMigration() {
  try {
    console.log('Adding content_blocks column to topics table...')
    
    await pool.query(`
      ALTER TABLE topics 
      ADD COLUMN IF NOT EXISTS content_blocks JSONB DEFAULT '[]';
    `)
    
    console.log('Creating index on content_blocks...')
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_topics_content_blocks 
      ON topics USING GIN (content_blocks);
    `)
    
    console.log('Migration completed successfully!')
    process.exit(0)
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigration()

