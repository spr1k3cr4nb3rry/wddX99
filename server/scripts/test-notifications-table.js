// Quick test script to verify notifications table exists
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'wddx99',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
})

async function testTable() {
  try {
    console.log('Testing notifications table...')
    
    // Check if table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'notifications'
      );
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Notifications table does NOT exist!')
      console.log('Run: npm run migrate:notifications')
      process.exit(1)
    }
    
    console.log('✅ Notifications table exists')
    
    // Try a simple query
    const result = await pool.query('SELECT COUNT(*) as count FROM notifications')
    console.log(`✅ Table is accessible. Current row count: ${result.rows[0].count}`)
    
    // Check columns
    const columns = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'notifications'
      ORDER BY ordinal_position;
    `)
    console.log('✅ Table columns:')
    columns.rows.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('❌ Error testing table:', error.message)
    console.error('Full error:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

testTable()

