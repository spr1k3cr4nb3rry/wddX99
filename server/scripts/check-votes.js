import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

async function checkVotes() {
  try {
    // Find AI topic
    const topics = await pool.query(
      "SELECT id, title FROM topics WHERE title LIKE '%AI in Education%'"
    )
    
    console.log('Topics found:', topics.rows.length)
    topics.rows.forEach(t => console.log(`  ID: ${t.id}, Title: ${t.title}`))
    
    if (topics.rows.length > 0) {
      const topicId = topics.rows[0].id
      
      // Check votes
      const votes = await pool.query(
        `SELECT COUNT(*) as count FROM proposition_votes 
         WHERE proposition_id = $1 AND proposition_type = 'topic'`,
        [topicId]
      )
      
      console.log(`\nVotes for topic ${topicId}: ${votes.rows[0].count}`)
      
      // Get vote breakdown
      const breakdown = await pool.query(
        `SELECT vote_value, user_group, COUNT(*) as count 
         FROM proposition_votes 
         WHERE proposition_id = $1 AND proposition_type = 'topic'
         GROUP BY vote_value, user_group`,
        [topicId]
      )
      
      console.log('\nVote breakdown:')
      breakdown.rows.forEach(row => {
        console.log(`  ${row.vote_value} - ${row.user_group}: ${row.count}`)
      })
    }
    
    // Check total votes
    const totalVotes = await pool.query(
      "SELECT COUNT(*) as count FROM proposition_votes WHERE proposition_type = 'topic'"
    )
    console.log(`\nTotal votes in system: ${totalVotes.rows[0].count}`)
    
    await pool.end()
  } catch (error) {
    console.error('Error:', error)
    await pool.end()
    process.exit(1)
  }
}

checkVotes()

