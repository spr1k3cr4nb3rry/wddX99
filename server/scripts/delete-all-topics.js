import pool from '../config/database.js'

async function deleteAllTopics() {
  try {
    console.log('Starting deletion of all topics...\n')
    
    // Delete votes first (foreign key constraint)
    const votesResult = await pool.query('DELETE FROM votes RETURNING id')
    console.log(`✓ Deleted ${votesResult.rows.length} votes`)
    
    // Delete comments first (foreign key constraint)
    const commentsResult = await pool.query('DELETE FROM comments RETURNING id')
    console.log(`✓ Deleted ${commentsResult.rows.length} comments`)
    
    // Delete all topics
    const topicsResult = await pool.query('DELETE FROM topics RETURNING id, title')
    console.log(`✓ Deleted ${topicsResult.rows.length} topics`)
    
    if (topicsResult.rows.length > 0) {
      console.log('\nDeleted topics:')
      topicsResult.rows.forEach((topic, index) => {
        console.log(`  ${index + 1}. ID: ${topic.id} - ${topic.title}`)
      })
    }
    
    // Verify deletion
    const remainingTopics = await pool.query('SELECT COUNT(*) as count FROM topics')
    const remainingVotes = await pool.query('SELECT COUNT(*) as count FROM votes')
    const remainingComments = await pool.query('SELECT COUNT(*) as count FROM comments')
    
    console.log('\n=== Verification ===')
    console.log(`Remaining topics: ${remainingTopics.rows[0].count}`)
    console.log(`Remaining votes: ${remainingVotes.rows[0].count}`)
    console.log(`Remaining comments: ${remainingComments.rows[0].count}`)
    
    console.log('\n✅ All topics deleted successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error deleting topics:', error)
    process.exit(1)
  }
}

deleteAllTopics()

