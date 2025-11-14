import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

async function updateConstraint() {
  try {
    console.log('Updating vote_value constraint...\n')

    // First, update existing votes from yes/no to agree/disagree
    console.log('Migrating existing votes...')
    const yesResult = await pool.query(
      `UPDATE proposition_votes 
       SET vote_value = 'agree' 
       WHERE vote_value = 'yes'`
    )
    console.log(`✓ Updated ${yesResult.rowCount} "yes" votes to "agree"`)

    const noResult = await pool.query(
      `UPDATE proposition_votes 
       SET vote_value = 'disagree' 
       WHERE vote_value = 'no'`
    )
    console.log(`✓ Updated ${noResult.rowCount} "no" votes to "disagree"`)

    // Drop the old constraint
    try {
      await pool.query(`
        ALTER TABLE proposition_votes 
        DROP CONSTRAINT IF EXISTS proposition_votes_vote_value_check
      `)
      console.log('✓ Dropped old constraint')
    } catch (error) {
      console.log('Note: Old constraint may not exist:', error.message)
    }

    // Add new constraint allowing agree, disagree, neutral
    await pool.query(`
      ALTER TABLE proposition_votes 
      ADD CONSTRAINT proposition_votes_vote_value_check 
      CHECK (vote_value IN ('agree', 'disagree', 'neutral'))
    `)
    console.log('✓ Added new constraint for agree/disagree/neutral')

    console.log('\n✓ Constraint update complete!')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Error updating constraint:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

updateConstraint()

