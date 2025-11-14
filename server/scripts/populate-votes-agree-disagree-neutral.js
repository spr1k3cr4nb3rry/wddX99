import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

async function populateVotes() {
  try {
    console.log('Populating votes with agree/disagree/neutral...\n')

    // Get all topics
    const topicsResult = await pool.query(
      "SELECT id FROM topics WHERE status = 'published' OR approved = true ORDER BY id"
    )

    if (topicsResult.rows.length === 0) {
      console.log('No topics found. Please create topics first.')
      process.exit(0)
    }

    // Get all users
    const usersResult = await pool.query(
      'SELECT id, user_group FROM users ORDER BY id'
    )

    if (usersResult.rows.length === 0) {
      console.log('No users found. Please create users first.')
      process.exit(0)
    }

    const topics = topicsResult.rows
    const users = usersResult.rows

    console.log(`Found ${topics.length} topics and ${users.length} users\n`)

    let totalVotes = 0
    let skipped = 0

    // Generate votes for each topic
    for (const topic of topics) {
      // Randomly select 50-90% of users to vote on this topic
      const votePercentage = 0.5 + Math.random() * 0.4 // 50-90%
      const numVoters = Math.max(1, Math.floor(users.length * votePercentage))
      
      // Shuffle and take random users
      const shuffledUsers = [...users].sort(() => Math.random() - 0.5)
      const voters = shuffledUsers.slice(0, numVoters)

      for (const voter of voters) {
        try {
          // Random vote: 40% agree, 35% disagree, 25% neutral
          const rand = Math.random()
          let voteValue
          if (rand < 0.4) {
            voteValue = 'agree'
          } else if (rand < 0.75) {
            voteValue = 'disagree'
          } else {
            voteValue = 'neutral'
          }
          
          const userGroup = voter.user_group || 'user'

          // Check if vote already exists
          const existingVote = await pool.query(
            `SELECT id FROM proposition_votes 
             WHERE proposition_id = $1 AND proposition_type = $2 AND user_id = $3`,
            [topic.id, 'topic', voter.id]
          )

          if (existingVote.rows.length === 0) {
            await pool.query(
              `INSERT INTO proposition_votes 
               (proposition_id, proposition_type, user_id, vote_value, user_group)
               VALUES ($1, $2, $3, $4, $5)`,
              [topic.id, 'topic', voter.id, voteValue, userGroup]
            )
            totalVotes++
          } else {
            // Update existing vote to new format
            await pool.query(
              `UPDATE proposition_votes 
               SET vote_value = $1, user_group = $2, updated_at = NOW()
               WHERE id = $3`,
              [voteValue, userGroup, existingVote.rows[0].id]
            )
            totalVotes++
          }
        } catch (error) {
          console.error(`Error inserting vote for topic ${topic.id}, user ${voter.id}:`, error.message)
        }
      }
    }

    // Update topic vote counts
    console.log('\nUpdating topic vote counts...')
    for (const topic of topics) {
      const voteCountResult = await pool.query(
        `SELECT COUNT(*) as count FROM proposition_votes 
         WHERE proposition_id = $1 AND proposition_type = $2`,
        [topic.id, 'topic']
      )
      const voteCount = parseInt(voteCountResult.rows[0].count)
      
      await pool.query(
        'UPDATE topics SET votes = $1 WHERE id = $2',
        [voteCount, topic.id]
      )
    }

    console.log(`\n✓ Successfully created/updated ${totalVotes} votes!`)
    console.log(`  (${skipped} votes were skipped)`)
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Error populating votes:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

populateVotes()

