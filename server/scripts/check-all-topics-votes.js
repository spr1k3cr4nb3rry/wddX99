import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

async function checkAll() {
  try {
    // Get all topics
    const topics = await pool.query(
      "SELECT id, title, votes FROM topics ORDER BY id"
    )
    
    console.log(`Found ${topics.rows.length} topics:\n`)
    
    for (const topic of topics.rows) {
      const votes = await pool.query(
        `SELECT COUNT(*) as count FROM proposition_votes 
         WHERE proposition_id = $1 AND proposition_type = 'topic'`,
        [topic.id]
      )
      
      const voteCount = parseInt(votes.rows[0].count)
      const dbVoteCount = parseInt(topic.votes || 0)
      
      console.log(`ID: ${topic.id}`)
      console.log(`  Title: ${topic.title.substring(0, 60)}...`)
      console.log(`  DB votes column: ${dbVoteCount}`)
      console.log(`  Actual votes in proposition_votes: ${voteCount}`)
      console.log('')
    }
    
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await pool.end()
    process.exit(1)
  }
}

checkAll()

