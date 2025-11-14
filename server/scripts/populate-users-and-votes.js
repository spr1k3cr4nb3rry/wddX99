import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import bcrypt from 'bcryptjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

const testUsers = [
  { name: 'John Smith', email: 'john@example.com', group: 'user' },
  { name: 'Jane Doe', email: 'jane@example.com', group: 'user' },
  { name: 'Bob Johnson', email: 'bob@example.com', group: 'user' },
  { name: 'Alice Williams', email: 'alice@example.com', group: 'user' },
  { name: 'Dr. Sarah Teacher', email: 'sarah.teacher@school.edu', group: 'teacher' },
  { name: 'Prof. Mike Educator', email: 'mike@university.edu', group: 'educator' },
  { name: 'Dr. Emily Expert', email: 'emily.expert@research.edu', group: 'expert' },
  { name: 'Dr. Robert Expert', email: 'robert@expert.org', group: 'expert' },
  { name: 'Lisa Teacher', email: 'lisa.teacher@school.edu', group: 'teacher' },
  { name: 'Tom Educator', email: 'tom@college.edu', group: 'educator' },
]

async function populateUsersAndVotes() {
  try {
    console.log('Starting user and vote population...\n')

    // Create test users if they don't exist
    const createdUsers = []
    const passwordHash = await bcrypt.hash('password123', 10)

    for (const userData of testUsers) {
      try {
        // Check if user exists
        const existingUser = await pool.query(
          'SELECT id FROM users WHERE email = $1',
          [userData.email]
        )

        if (existingUser.rows.length === 0) {
          const result = await pool.query(
            `INSERT INTO users (name, email, password, user_group, role)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, name, user_group`,
            [userData.name, userData.email, passwordHash, userData.group, 'user']
          )
          createdUsers.push(result.rows[0])
          console.log(`✓ Created user: ${userData.name} (${userData.group})`)
        } else {
          // Update user group if needed
          await pool.query(
            'UPDATE users SET user_group = $1 WHERE id = $2',
            [userData.group, existingUser.rows[0].id]
          )
          createdUsers.push({ id: existingUser.rows[0].id, name: userData.name, user_group: userData.group })
        }
      } catch (error) {
        console.error(`✗ Failed to create user ${userData.name}:`, error.message)
      }
    }

    // Get all users (including existing ones)
    const allUsersResult = await pool.query(
      'SELECT id, user_group FROM users ORDER BY id'
    )
    const allUsers = allUsersResult.rows

    console.log(`\nTotal users available: ${allUsers.length}\n`)

    // Get all topics
    const topicsResult = await pool.query(
      "SELECT id FROM topics WHERE status = 'published' OR approved = true ORDER BY id"
    )

    if (topicsResult.rows.length === 0) {
      console.log('No topics found. Please create topics first.')
      process.exit(0)
    }

    const topics = topicsResult.rows
    console.log(`Found ${topics.length} topics\n`)

    let totalVotes = 0
    let skipped = 0

    // Generate votes for each topic
    for (const topic of topics) {
      // Randomly select 50-90% of users to vote on this topic
      const votePercentage = 0.5 + Math.random() * 0.4 // 50-90%
      const numVoters = Math.max(1, Math.floor(allUsers.length * votePercentage))
      
      // Shuffle and take random users
      const shuffledUsers = [...allUsers].sort(() => Math.random() - 0.5)
      const voters = shuffledUsers.slice(0, numVoters)

      for (const voter of voters) {
        try {
          // Random vote: 55% yes, 45% no (slight bias toward yes)
          const voteValue = Math.random() < 0.55 ? 'yes' : 'no'
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
            skipped++
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

    console.log(`\n✓ Successfully created ${totalVotes} votes!`)
    console.log(`  (${skipped} votes already existed and were skipped)`)
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Error populating votes:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

populateUsersAndVotes()

