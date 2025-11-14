import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load .env file
dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

const sampleTopics = [
  {
    title: 'The Future of Online Learning: Trends and Innovations',
    description: 'Exploring how online learning platforms are evolving to meet the needs of modern students and educators.',
    category: 'Technology',
    tags: ['Online Learning', 'EdTech', 'Innovation', 'Digital Education'],
    abstract: 'Online learning has transformed education in unprecedented ways. This article examines current trends, emerging technologies, and the future direction of digital education platforms.',
    image: '/images/onlinelearning.jpg',
    read_time: 8
  },
  {
    title: 'Team-Based Learning: A Comprehensive Guide',
    description: 'Understanding the principles and practices of team-based learning in educational settings.',
    category: 'Pedagogy',
    tags: ['Team Learning', 'Collaboration', 'Teaching Methods', 'Active Learning'],
    abstract: 'Team-based learning (TBL) is an instructional strategy that promotes active learning through small group collaboration. This comprehensive guide covers the fundamentals, implementation strategies, and best practices.',
    image: '/images/projectlearning.jpg',
    read_time: 12
  },
  {
    title: 'Gamification in Education: Engaging Students Through Play',
    description: 'How game mechanics can enhance student engagement and learning outcomes in educational environments.',
    category: 'Innovation',
    tags: ['Gamification', 'Engagement', 'Student Motivation', 'Interactive Learning'],
    abstract: 'Gamification applies game design elements to educational contexts, creating more engaging and motivating learning experiences. This article explores successful implementations and their impact on student outcomes.',
    image: '/images/gamification.jpg',
    read_time: 10
  },
  {
    title: 'STEM Education: Preparing Students for the Future',
    description: 'The importance of STEM education and strategies for effective implementation in schools.',
    category: 'STEM',
    tags: ['STEM', 'Science', 'Technology', 'Future Skills'],
    abstract: 'STEM education prepares students for careers in science, technology, engineering, and mathematics. This article discusses curriculum design, teaching strategies, and the critical role of STEM in modern education.',
    image: '/images/stem.jpg',
    read_time: 9
  },
  {
    title: 'The Role of Teachers in Modern Education',
    description: 'How the role of educators is evolving in the digital age and what it means for teaching practice.',
    category: 'Teaching',
    tags: ['Teachers', 'Education', 'Professional Development', 'Pedagogy'],
    abstract: 'Teachers remain at the heart of education, but their roles are evolving. This article examines how educators are adapting to new technologies, changing student needs, and shifting educational paradigms.',
    image: '/images/roleofteachers.jpg',
    read_time: 11
  },
  {
    title: 'Fast Learning Techniques: Accelerating Student Progress',
    description: 'Evidence-based strategies for helping students learn more efficiently and effectively.',
    category: 'Learning',
    tags: ['Learning Techniques', 'Study Skills', 'Efficiency', 'Student Success'],
    abstract: 'Fast learning techniques can help students master material more quickly while maintaining comprehension. This article reviews research-backed methods for accelerating learning.',
    image: '/images/fastlearning.jpg',
    read_time: 7
  },
  {
    title: 'Career Preparation in Higher Education',
    description: 'How universities and colleges are preparing students for successful career transitions.',
    category: 'Career',
    tags: ['Career', 'Higher Education', 'Student Success', 'Professional Development'],
    abstract: 'Career preparation is increasingly important in higher education. This article explores innovative programs and partnerships that help students transition from education to employment.',
    image: '/images/career.jpg',
    read_time: 8
  },
  {
    title: 'Degree Programs: Choosing the Right Path',
    description: 'Guidance for students navigating degree program selection and educational planning.',
    category: 'Education',
    tags: ['Degrees', 'Student Planning', 'Higher Education', 'Academic Planning'],
    abstract: 'Choosing the right degree program is a critical decision for students. This article provides frameworks and considerations for making informed educational choices.',
    image: '/images/degree.jpg',
    read_time: 6
  },
  {
    title: 'Learning Models: Traditional vs. Modern Approaches',
    description: 'Comparing traditional learning models with contemporary educational approaches and their effectiveness.',
    category: 'Pedagogy',
    tags: ['Learning Models', 'Teaching Methods', 'Educational Theory', 'Pedagogy'],
    abstract: 'Educational models have evolved significantly over time. This article compares traditional approaches with modern methodologies, examining their strengths and applications.',
    image: '/images/learningmodels.jpg',
    read_time: 10
  },
  {
    title: 'Artificial Intelligence in Education: Opportunities and Challenges',
    description: 'Exploring how AI technologies are being integrated into educational systems and their potential impact.',
    category: 'Technology',
    tags: ['AI', 'Artificial Intelligence', 'EdTech', 'Innovation'],
    abstract: 'Artificial intelligence is revolutionizing education through personalized learning, automated assessment, and intelligent tutoring systems. This article examines current applications and future possibilities.',
    image: '/images/ai.jpg',
    read_time: 13
  },
  {
    title: 'Project-Based Learning: Engaging Students Through Real-World Projects',
    description: 'How project-based learning creates meaningful educational experiences and develops practical skills.',
    category: 'Pedagogy',
    tags: ['Project Learning', 'Active Learning', 'Student Engagement', 'Practical Skills'],
    abstract: 'Project-based learning immerses students in real-world challenges, fostering critical thinking and practical problem-solving skills. This article explores implementation strategies and outcomes.',
    image: '/images/projectlearning.jpg',
    read_time: 9
  },
  {
    title: 'The Future of Online Learning: Trends and Innovations',
    description: 'Exploring how online learning platforms are evolving to meet the needs of modern students and educators.',
    category: 'Technology',
    tags: ['Online Learning', 'EdTech', 'Innovation', 'Digital Education'],
    abstract: 'Online learning has transformed education in unprecedented ways. This article examines current trends, emerging technologies, and the future direction of digital education platforms.',
    image: '/images/onlinelearning.jpg',
    read_time: 8
  }
]

async function populateTopics() {
  try {
    console.log('Starting topic population...\n')

    // Get or create a default user (admin)
    let userId
    const userResult = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    )

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id
      console.log(`Using existing admin user (ID: ${userId})`)
    } else {
      // Try to get any user
      const anyUserResult = await pool.query('SELECT id FROM users LIMIT 1')
      if (anyUserResult.rows.length > 0) {
        userId = anyUserResult.rows[0].id
        console.log(`Using existing user (ID: ${userId})`)
      } else {
        // Create a default user if none exists
        const newUserResult = await pool.query(
          `INSERT INTO users (name, email, password, role) 
           VALUES ($1, $2, $3, $4) 
           RETURNING id`,
          ['Admin User', 'admin@example.com', '$2a$10$dummy', 'admin']
        )
        userId = newUserResult.rows[0].id
        console.log(`Created default admin user (ID: ${userId})`)
      }
    }

    // Insert topics
    let inserted = 0
    for (const topic of sampleTopics) {
      try {
        const result = await pool.query(
          `INSERT INTO topics 
           (title, description, category, tags, image, user_id, abstract, status, approved, approved_by, approved_at, read_time, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), $11, NOW())
           RETURNING id, title`,
          [
            topic.title,
            topic.description,
            topic.category,
            JSON.stringify(topic.tags),
            topic.image,
            userId,
            topic.abstract,
            'published',
            true,
            userId,
            topic.read_time
          ]
        )
        inserted++
        console.log(`✓ Inserted: ${result.rows[0].title} (ID: ${result.rows[0].id})`)
      } catch (error) {
        console.error(`✗ Failed to insert "${topic.title}":`, error.message)
      }
    }

    console.log(`\n✓ Successfully inserted ${inserted} topics!`)
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Error populating topics:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

populateTopics()

