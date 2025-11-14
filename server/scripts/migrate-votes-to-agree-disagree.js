import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

async function migrateVotes() {
  try {
    console.log('Migrating votes from yes/no to agree/disagree...\n')

    // Update yes -> agree
    const yesResult = await pool.query(
      `UPDATE proposition_votes 
       SET vote_value = 'agree' 
       WHERE vote_value = 'yes'`
    )
    console.log(`✓ Updated ${yesResult.rowCount} "yes" votes to "agree"`)

    // Update no -> disagree
    const noResult = await pool.query(
      `UPDATE proposition_votes 
       SET vote_value = 'disagree' 
       WHERE vote_value = 'no'`
    )
    console.log(`✓ Updated ${noResult.rowCount} "no" votes to "disagree"`)

    console.log('\n✓ Migration complete!')
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Error migrating votes:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrateVotes()

