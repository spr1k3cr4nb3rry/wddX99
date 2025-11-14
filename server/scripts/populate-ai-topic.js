import pool from '../config/database.js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(__dirname, '..', '.env') })
dotenv.config({ path: join(__dirname, '..', '..', '.env') })
dotenv.config()

const fullContent = {
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      content: [
        'The integration of artificial intelligence in educational settings represents one of the most significant technological shifts in modern pedagogy. As educational institutions worldwide grapple with the challenges of personalized instruction, resource allocation, and student engagement, AI technologies offer promising solutions that can transform how we teach and learn.',
        'This research examines the current state of AI implementation in education, analyzes successful case studies from institutions that have pioneered these technologies, and explores the potential for future innovation. We investigate how AI can address persistent challenges in education, including learning gaps, assessment scalability, and individualized instruction.'
      ]
    },
    {
      id: 'background',
      title: 'Background and Context',
      content: [
        'The concept of artificial intelligence in education is not entirely new. Early adaptive learning systems emerged in the 1970s, but recent advances in machine learning, natural language processing, and computer vision have dramatically expanded the possibilities for AI in educational contexts.',
        'Today\'s AI-powered educational tools can analyze vast amounts of student data, identify learning patterns, and provide personalized recommendations. These systems can adapt to individual learning styles, pace, and preferences, creating more effective and engaging learning experiences.',
        'The COVID-19 pandemic accelerated the adoption of digital learning technologies, highlighting both the potential and limitations of current educational technology. This period of rapid change has created an opportunity to reimagine how AI can support both remote and in-person learning environments.'
      ]
    },
    {
      id: 'methodology',
      title: 'Research Methodology',
      content: [
        'This study employs a mixed-methods approach, combining quantitative analysis of student performance data with qualitative insights from educators and administrators. We conducted surveys with over 500 educators across 50 institutions, analyzed performance data from 10,000 students using AI-powered learning platforms, and conducted in-depth interviews with 25 educational technology leaders.',
        'Our research focused on three primary areas: (1) the effectiveness of AI-powered personalized learning systems, (2) the impact of automated assessment tools on student outcomes, and (3) the challenges and opportunities in implementing AI technologies in educational settings.',
        'Data collection occurred over an 18-month period, allowing us to observe both short-term and long-term effects of AI implementation. We used statistical analysis to identify significant patterns in student performance and qualitative coding to analyze themes in educator feedback.'
      ]
    },
    {
      id: 'findings',
      title: 'Key Findings',
      content: [
        'Our research revealed several significant findings about the impact of AI in education. Students using AI-powered personalized learning platforms showed an average improvement of 23% in test scores compared to traditional instruction methods. Additionally, these students demonstrated higher levels of engagement and reported greater satisfaction with their learning experiences.',
        'Automated assessment tools proved particularly effective in providing immediate feedback to students, with 78% of students reporting that instant feedback helped them understand concepts more quickly. Educators noted that AI-powered grading systems freed up significant time, allowing them to focus on higher-level instructional activities.',
        'However, our research also identified important challenges. Implementation costs, technical training requirements, and concerns about data privacy emerged as significant barriers to adoption. Additionally, some educators expressed concerns about the potential for AI systems to perpetuate existing biases or reduce the human element in education.'
      ]
    },
    {
      id: 'analysis',
      title: 'Analysis and Discussion',
      content: [
        'The findings suggest that AI technologies have significant potential to enhance educational outcomes, but successful implementation requires careful consideration of pedagogical principles, technical infrastructure, and ethical concerns. The most successful implementations combined AI tools with strong teacher support and clear pedagogical goals.',
        'One key insight is that AI should augment, rather than replace, human educators. The most effective implementations used AI to handle routine tasks like grading and content delivery, while allowing teachers to focus on personalized instruction, mentorship, and addressing complex learning needs.',
        'The research also highlights the importance of addressing equity concerns. While AI has the potential to democratize access to high-quality education, there is a risk that it could exacerbate existing inequalities if not implemented thoughtfully. Institutions must ensure that AI tools are accessible to all students and that the benefits are distributed equitably.'
      ]
    },
    {
      id: 'implications',
      title: 'Implications for Education',
      content: [
        'The implications of this research extend beyond individual classrooms to entire educational systems. As AI technologies become more sophisticated and accessible, educational institutions must develop comprehensive strategies for integration that prioritize student learning outcomes and ethical considerations.',
        'Educational leaders should invest in professional development programs that help educators understand how to effectively use AI tools. This includes training on interpreting AI-generated insights, integrating AI recommendations into instructional practices, and maintaining the human connection that is essential to effective teaching.',
        'Policymakers and educational administrators must also address infrastructure needs, data privacy concerns, and funding requirements. The successful integration of AI in education requires not just technological investment, but also a commitment to ongoing support, evaluation, and refinement of AI systems.'
      ]
    },
    {
      id: 'conclusion',
      title: 'Conclusion',
      content: [
        'Artificial intelligence represents a transformative force in education, offering unprecedented opportunities to personalize learning, improve assessment, and enhance student engagement. However, realizing this potential requires thoughtful implementation, ongoing evaluation, and a commitment to maintaining the human elements that make education meaningful.',
        'As we move forward, it is essential that educators, researchers, and policymakers work together to ensure that AI technologies serve the best interests of students and support the fundamental goals of education. This includes addressing equity concerns, maintaining ethical standards, and preserving the irreplaceable role of human educators in the learning process.',
        'The future of education will likely involve a thoughtful integration of AI technologies with human expertise, creating learning environments that are both technologically advanced and deeply human. By approaching AI implementation with care, creativity, and a focus on student outcomes, we can harness these technologies to create more effective, engaging, and equitable educational experiences.'
      ]
    }
  ],
  references: [
    'Anderson, J. R., & Schunn, C. D. (2020). Implications of the ACT-R learning theory: No magic bullets. Educational Psychology Review, 32(1), 1-23.',
    'Baker, R. S., & Inventado, P. S. (2019). Educational data mining and learning analytics. In Learning analytics (pp. 61-75). Springer.',
    'Chen, L., Chen, P., & Lin, Z. (2020). Artificial intelligence in education: A review. IEEE Access, 8, 75264-75278.',
    'Holmes, W., Bialik, M., & Fadel, C. (2019). Artificial intelligence in education: Promises and implications for teaching and learning. Center for Curriculum Redesign.',
    'Zawacki-Richter, O., Marín, V. I., Bond, M., & Gouverneur, F. (2019). Systematic review of research on artificial intelligence applications in higher education. International Journal of Educational Technology in Higher Education, 16(1), 1-27.'
  ]
}

const visualizations = [
  {
    type: 'bar',
    title: 'Student Performance Improvement with AI Tools',
    data: [
      { name: 'Traditional', 'Average Score (%)': 72 },
      { name: 'AI-Powered', 'Average Score (%)': 95 },
      { name: 'Hybrid Approach', 'Average Score (%)': 88 }
    ],
    config: {
      xKey: 'name',
      bars: [{ dataKey: 'Average Score (%)', name: 'Average Score (%)' }],
      description: 'Comparison of average student test scores across different instructional approaches'
    }
  },
  {
    type: 'line',
    title: 'AI Adoption in Education Over Time',
    data: [
      { year: '2019', adoption: 15 },
      { year: '2020', adoption: 28 },
      { year: '2021', adoption: 42 },
      { year: '2022', adoption: 58 },
      { year: '2023', adoption: 73 },
      { year: '2024', adoption: 85 }
    ],
    config: {
      xKey: 'year',
      lines: [{ dataKey: 'adoption', name: 'Adoption Rate (%)' }],
      description: 'Percentage of educational institutions implementing AI tools'
    }
  },
  {
    type: 'pie',
    title: 'AI Tool Usage by Category',
    data: [
      { name: 'Personalized Learning', value: 35 },
      { name: 'Automated Assessment', value: 28 },
      { name: 'Intelligent Tutoring', value: 22 },
      { name: 'Content Generation', value: 15 }
    ],
    config: {
      dataKey: 'value',
      nameKey: 'name',
      description: 'Distribution of AI tool usage across different educational applications'
    }
  }
]

const comments = [
  {
    content: 'This research provides valuable insights into the practical implementation of AI in education. The mixed-methods approach is particularly strong, and the findings regarding student performance improvements are compelling.',
    user_id: null // Will be set to a real user
  },
  {
    content: 'I appreciate the focus on equity concerns. Too often, AI implementation overlooks these critical issues. The section on addressing bias in educational AI systems is particularly relevant.',
    user_id: null
  },
  {
    content: 'The longitudinal data presented here is impressive. The 18-month study period provides strong evidence for the sustained benefits of AI integration in educational settings. I would be interested in seeing follow-up studies at the 3-year mark.',
    user_id: null
  },
  {
    content: 'As an administrator, I find the cost-benefit analysis particularly useful. The ROI calculations help justify the initial investment in AI infrastructure. However, I would like to see more discussion about ongoing maintenance costs.',
    user_id: null
  },
  {
    content: 'The comparison between traditional and AI-powered learning approaches is well-documented. However, I think the research could benefit from more discussion about the hybrid model, which seems to offer the best of both worlds.',
    user_id: null
  },
  {
    content: 'Excellent work on addressing the ethical considerations. The framework for responsible AI implementation in education should be adopted as a standard across institutions.',
    user_id: null
  },
  {
    content: 'The visualization of AI adoption trends is particularly striking. It clearly shows the acceleration of adoption post-2020, likely driven by the shift to remote learning during the pandemic.',
    user_id: null
  },
  {
    content: 'I would like to see more research on the long-term effects of AI on student critical thinking skills. While the performance metrics are positive, we need to ensure we\'re not just teaching to the test.',
    user_id: null
  }
]

async function populateAITopic() {
  try {
    console.log('Populating AI in Education topic with full content...\n')

    // Find the AI topic
    const topicResult = await pool.query(
      "SELECT id FROM topics WHERE title LIKE '%AI in Education%' OR title LIKE '%Artificial Intelligence%' ORDER BY id LIMIT 1"
    )

    if (topicResult.rows.length === 0) {
      console.log('AI topic not found. Please create it first.')
      process.exit(0)
    }

    const topicId = topicResult.rows[0].id
    console.log(`Found topic ID: ${topicId}\n`)

    // Get users for comments
    const usersResult = await pool.query('SELECT id FROM users ORDER BY id LIMIT 8')
    const userIds = usersResult.rows.map(u => u.id)

    // Update topic with full content
    console.log('Updating topic with full content...')
    await pool.query(
      `UPDATE topics 
       SET content = $1, 
           visualizations = $2,
           abstract = $3,
           author_bio = $4,
           read_time = $5,
           updated_at = NOW()
       WHERE id = $6`,
      [
        JSON.stringify(fullContent),
        JSON.stringify(visualizations),
        'Artificial Intelligence is revolutionizing the educational landscape, offering unprecedented opportunities for personalized learning, automated assessment, and intelligent tutoring systems. This comprehensive research explores how AI technologies can transform teaching methodologies, enhance student engagement, and address equity gaps in education.',
        'Dr. Sarah Johnson is a leading researcher in educational technology with over 15 years of experience. Her work focuses on the integration of AI and machine learning in educational settings, with particular emphasis on personalized learning and adaptive assessment systems.',
        12,
        topicId
      ]
    )
    console.log('✓ Updated topic content\n')

    // Add comments
    console.log('Adding comments...')
    let commentCount = 0
    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i]
      const userId = userIds[i % userIds.length] // Cycle through users
      
      try {
        await pool.query(
          `INSERT INTO comments (topic_id, user_id, content, created_at)
           VALUES ($1, $2, $3, NOW() - INTERVAL '${i} days')`,
          [topicId, userId, comment.content]
        )
        commentCount++
      } catch (error) {
        console.error(`Error adding comment ${i + 1}:`, error.message)
      }
    }

    // Update comment count
    const commentCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM comments WHERE topic_id = $1',
      [topicId]
    )
    const totalComments = parseInt(commentCountResult.rows[0].count)
    
    await pool.query(
      'UPDATE topics SET comment_count = $1, comments = $1 WHERE id = $2',
      [totalComments, topicId]
    )

    console.log(`✓ Added ${commentCount} comments`)
    console.log(`✓ Total comments: ${totalComments}\n`)

    console.log('✓ Successfully populated AI topic with full content!')
    console.log(`  Topic ID: ${topicId}`)
    console.log(`  Sections: ${fullContent.sections.length}`)
    console.log(`  References: ${fullContent.references.length}`)
    console.log(`  Visualizations: ${visualizations.length}`)
    console.log(`  Comments: ${totalComments}`)
    
    process.exit(0)
  } catch (error) {
    console.error('\n✗ Error populating topic:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

populateAITopic()

