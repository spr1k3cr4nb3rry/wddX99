import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { useAuth } from '../context/AuthContext'
import { canVote, canComment } from '../utils/permissions'
import { topicsAPI } from '../services/api'
import ReadingProgress from '../components/topic/ReadingProgress/ReadingProgress'
import TableOfContents from '../components/topic/TableOfContents/TableOfContents'
import ArticleSection from '../components/topic/ArticleSection/ArticleSection'
import Visualization from '../components/topic/Visualization/Visualization'
import CommentsSection from '../components/topic/CommentsSection/CommentsSection'
import RelatedTopics from '../components/topic/RelatedTopics/RelatedTopics'
import ArticleMeta from '../components/topic/ArticleMeta/ArticleMeta'
import ShareButtons from '../components/topic/ShareButtons/ShareButtons'
import ExportMenu from '../components/topic/ExportMenu/ExportMenu'
import BookmarkButton from '../components/common/BookmarkButton/BookmarkButton'
import { PullQuote, CTABox, InfoBox, CodeBlock, ImageGallery } from '../components/topic/ContentBlocks'
import YesNoVote from '../components/voting/YesNoVote'
import LazyImage from '../components/common/LazyImage/LazyImage'
import LoadingSpinner from '../components/common/LoadingSpinner/LoadingSpinner'
import './TopicDetailPage.css'
import '../styles/print.css'

function TopicDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [topic, setTopic] = useState(null)
  const [loading, setLoading] = useState(true)

  // Mock data with full article structure - will be replaced with API call
  const mockTopics = {
    '1': {
      id: 1,
      title: 'AI in Education: Transforming Learning Through Intelligent Technology',
      description: 'How will emerging technologies, shifting workforce demands, and evolving social dynamics transform the landscape of education?',
      abstract: 'Artificial Intelligence is revolutionizing the educational landscape, offering unprecedented opportunities for personalized learning, automated assessment, and intelligent tutoring systems. This comprehensive research explores how AI technologies can transform teaching methodologies, enhance student engagement, and address equity gaps in education.',
      author: {
        name: 'Dr. Sarah Johnson',
        avatar: '/images/placeholder.svg',
        title: 'Professor of Educational Technology',
        bio: 'Dr. Sarah Johnson is a leading researcher in educational technology with over 15 years of experience. Her work focuses on the integration of AI and machine learning in educational settings, with particular emphasis on personalized learning and adaptive assessment systems.'
      },
      category: 'Technology',
      tags: ['AI', 'Innovation', 'Future', 'Machine Learning', 'EdTech'],
      votes: 42,
      commentsCount: 10,
      views: 128,
      readTime: 12,
      status: 'Trending',
      createdAt: '2024-01-15',
      lastUpdated: '2024-01-20',
      image: '/images/ai.jpg',
      content: {
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
      },
      visualizations: [
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
      ],
      metadata: {
        methodology: 'Mixed Methods',
        sampleSize: '10,000 students, 500 educators',
        duration: '18 months',
        researchStatus: 'Completed'
      },
      relatedTopics: [
        { id: 2, title: 'The Future of Online Learning', category: 'Technology' },
        { id: 3, title: 'Personalized Learning Strategies', category: 'Pedagogy' },
        { id: 4, title: 'Educational Data Analytics', category: 'Research' }
      ],
      comments: [
        {
          id: 1,
          author: { name: 'Dr. Michael Chen', avatar: '/images/placeholder.svg' },
          content: 'This research provides valuable insights into the practical implementation of AI in education. The mixed-methods approach is particularly strong, and the findings regarding student performance improvements are compelling.',
          createdAt: '2024-01-16T10:30:00Z',
          replies: [
            {
              id: 11,
              author: { name: 'Dr. Sarah Johnson', avatar: '/images/placeholder.svg' },
              content: 'Thank you for your thoughtful feedback. The mixed-methods approach allowed us to capture both quantitative outcomes and qualitative insights from educators.',
              createdAt: '2024-01-16T11:15:00Z'
            }
          ]
        },
        {
          id: 2,
          author: { name: 'Prof. Emily Rodriguez', avatar: '/images/placeholder.svg' },
          content: 'I appreciate the focus on equity concerns. Too often, AI implementation overlooks these critical issues. The section on addressing bias in educational AI systems is particularly relevant.',
          createdAt: '2024-01-17T14:20:00Z',
          replies: [
            {
              id: 3,
              author: { name: 'Dr. Sarah Johnson', avatar: '/images/placeholder.svg' },
              content: 'Thank you for the feedback. Equity was a central concern throughout our research process. We found that institutions that prioritized equity in their AI implementation saw better outcomes across all student demographics.',
              createdAt: '2024-01-17T15:00:00Z'
            },
            {
              id: 12,
              author: { name: 'Dr. James Wilson', avatar: '/images/placeholder.svg' },
              content: 'I completely agree. The bias mitigation strategies outlined in the research should be mandatory for any educational institution implementing AI tools.',
              createdAt: '2024-01-17T16:30:00Z'
            }
          ]
        },
        {
          id: 4,
          author: { name: 'Dr. Patricia Martinez', avatar: '/images/placeholder.svg' },
          content: 'The longitudinal data presented here is impressive. The 18-month study period provides strong evidence for the sustained benefits of AI integration in educational settings. I would be interested in seeing follow-up studies at the 3-year mark.',
          createdAt: '2024-01-18T09:15:00Z',
          replies: []
        },
        {
          id: 5,
          author: { name: 'Prof. Robert Thompson', avatar: '/images/placeholder.svg' },
          content: 'As an administrator, I find the cost-benefit analysis particularly useful. The ROI calculations help justify the initial investment in AI infrastructure. However, I would like to see more discussion about ongoing maintenance costs.',
          createdAt: '2024-01-18T14:45:00Z',
          replies: [
            {
              id: 13,
              author: { name: 'Dr. Sarah Johnson', avatar: '/images/placeholder.svg' },
              content: 'That\'s an excellent point. We are currently conducting a follow-up study that includes detailed cost analysis over a 3-year period. The preliminary data suggests that maintenance costs decrease significantly after the initial implementation phase.',
              createdAt: '2024-01-18T15:20:00Z'
            }
          ]
        },
        {
          id: 6,
          author: { name: 'Dr. Lisa Anderson', avatar: '/images/placeholder.svg' },
          content: 'The methodology section is thorough and well-documented. The combination of quantitative performance metrics with qualitative educator interviews provides a comprehensive view of AI implementation challenges and successes.',
          createdAt: '2024-01-19T10:00:00Z',
          replies: []
        },
        {
          id: 7,
          author: { name: 'Prof. David Kim', avatar: '/images/placeholder.svg' },
          content: 'I\'ve been implementing AI tools in my classroom for the past year, and many of the findings align with my personal experience. The section on teacher training and professional development resonates particularly well with what I\'ve observed.',
          createdAt: '2024-01-19T13:30:00Z',
          replies: [
            {
              id: 14,
              author: { name: 'Dr. Sarah Johnson', avatar: '/images/placeholder.svg' },
              content: 'Thank you for sharing your experience. Teacher training emerged as one of the most critical success factors in our study. Educators who received comprehensive training reported higher confidence and better student outcomes.',
              createdAt: '2024-01-19T14:00:00Z'
            },
            {
              id: 15,
              author: { name: 'Dr. Maria Garcia', avatar: '/images/placeholder.svg' },
              content: 'I completely agree. In our institution, we found that ongoing professional development, not just initial training, was key to successful AI adoption.',
              createdAt: '2024-01-19T14:45:00Z'
            }
          ]
        },
        {
          id: 8,
          author: { name: 'Dr. Thomas Brown', avatar: '/images/placeholder.svg' },
          content: 'The visualization of AI adoption trends over time is particularly striking. It clearly demonstrates the accelerating pace of implementation across educational institutions. This data will be valuable for strategic planning.',
          createdAt: '2024-01-20T08:20:00Z',
          replies: []
        },
        {
          id: 9,
          author: { name: 'Prof. Jennifer White', avatar: '/images/placeholder.svg' },
          content: 'While the research is comprehensive, I would like to see more discussion about the limitations and potential risks of AI in education. What are the scenarios where AI might not be appropriate?',
          createdAt: '2024-01-20T11:10:00Z',
          replies: [
            {
              id: 16,
              author: { name: 'Dr. Sarah Johnson', avatar: '/images/placeholder.svg' },
              content: 'That\'s an important question. In our research, we identified several scenarios where AI tools were less effective, particularly in subjects requiring significant creative expression or complex interpersonal interactions. We plan to publish a follow-up paper specifically addressing these limitations.',
              createdAt: '2024-01-20T12:00:00Z'
            }
          ]
        },
        {
          id: 10,
          author: { name: 'Dr. Christopher Lee', avatar: '/images/placeholder.svg' },
          content: 'The ethical framework proposed in this research should serve as a model for other institutions. The emphasis on transparency, accountability, and student privacy is commendable.',
          createdAt: '2024-01-20T15:30:00Z',
          replies: []
        }
      ]
    },
    '3': {
      id: 3,
      title: 'The Value of a College Degree in 2025: Analyzing Evolving Worth and Career Impact',
      description: 'Analyzing the evolving worth of higher education degrees and their impact on career trajectories in the current economic landscape.',
      abstract: 'As the economic landscape continues to evolve, the value of a college degree remains a subject of intense debate. This comprehensive research examines the changing worth of higher education degrees in 2025, analyzing their impact on career trajectories, earning potential, and professional opportunities. Through extensive data analysis and longitudinal studies, we explore how college degrees continue to provide value in an increasingly competitive job market.',
      author: {
        name: 'Elena M. Calder',
        avatar: '/images/placeholder.svg',
        title: 'Professor of Economics and Education Policy',
        bio: 'Dr. Elena M. Calder is a leading researcher in education economics with over 20 years of experience. Her work focuses on the economic returns of higher education, labor market outcomes, and the evolving value of academic credentials in the modern economy.'
      },
      category: 'Education',
      tags: ['Degree', 'Value', '2025', 'Career', 'Economics'],
      votes: 35,
      commentsCount: 20,
      views: 156,
      readTime: 10,
      status: 'Popular',
      createdAt: '2024-01-10',
      lastUpdated: '2024-01-18',
      image: '/images/degree.jpg',
      content: {
        sections: [
          {
            id: 'introduction',
            title: 'Introduction',
            content: [
              'The value of a college degree has been a subject of ongoing debate, particularly as the economic landscape continues to evolve. In 2025, this conversation has become more nuanced, with questions about return on investment, alternative pathways, and the changing nature of work. This research examines the current state of higher education value, analyzing both quantitative outcomes and qualitative perspectives from graduates, employers, and policymakers.',
              'Our study investigates how college degrees continue to provide value in an increasingly competitive and rapidly changing job market. We explore earning potential, career advancement opportunities, job security, and the broader benefits of higher education beyond financial returns.'
            ]
          },
          {
            id: 'economic-returns',
            title: 'Economic Returns and Earning Potential',
            content: [
              'Data from the Bureau of Labor Statistics and longitudinal studies consistently show that college graduates earn significantly more over their lifetimes compared to those with only a high school diploma. In 2025, the median weekly earnings for bachelor\'s degree holders remain substantially higher, with the wage premium continuing to grow in certain fields.',
              'However, the economic returns vary significantly by field of study. STEM degrees, business, and healthcare continue to show the highest earning potential, while degrees in the humanities and social sciences, while still valuable, show more variable returns. This variation highlights the importance of considering both the degree itself and the specific field of study when evaluating value.',
              'Beyond initial earnings, college graduates also experience greater lifetime earnings growth. The compounding effect of higher starting salaries, more frequent promotions, and access to higher-paying positions results in a substantial lifetime earnings advantage for degree holders.'
            ]
          },
          {
            id: 'career-opportunities',
            title: 'Career Opportunities and Advancement',
            content: [
              'College degrees continue to serve as gateways to professional opportunities that might otherwise be inaccessible. Many employers still require or strongly prefer candidates with bachelor\'s degrees, even for positions where the degree itself may not be directly related to the work. This credentialing function of degrees remains significant in 2025.',
              'Graduates report greater access to professional networks, mentorship opportunities, and career advancement pathways. The college experience provides not just academic knowledge, but also critical thinking skills, communication abilities, and professional connections that facilitate career growth.',
              'Additionally, college graduates are more likely to have access to employer-sponsored benefits, professional development opportunities, and positions with greater job security. These factors contribute to the overall value proposition of higher education beyond immediate salary considerations.'
            ]
          },
          {
            id: 'changing-landscape',
            title: 'The Changing Educational Landscape',
            content: [
              'The value proposition of college degrees is evolving in response to several factors. The rise of alternative credentials, micro-degrees, and skills-based hiring has created new pathways to career success. Some employers are beginning to prioritize demonstrated skills and competencies over traditional degree requirements.',
              'However, this shift is not uniform across industries. Many fields, particularly those requiring professional licensure or advanced technical knowledge, continue to value traditional degrees highly. The healthcare, engineering, and education sectors, for example, maintain strong degree requirements.',
              'The cost of higher education has also become a critical factor in evaluating value. As tuition costs have risen, students and families are increasingly weighing the return on investment. This has led to greater scrutiny of degree programs and a growing emphasis on outcomes-based evaluation.'
            ]
          },
          {
            id: 'non-financial-benefits',
            title: 'Non-Financial Benefits of Higher Education',
            content: [
              'While economic returns are often the primary focus of value discussions, college degrees provide numerous non-financial benefits that contribute to overall life satisfaction and well-being. Research consistently shows that college graduates report higher levels of job satisfaction, better health outcomes, and greater civic engagement.',
              'The college experience fosters critical thinking, problem-solving abilities, and intellectual curiosity that extend beyond the workplace. Graduates often report feeling more prepared to navigate complex challenges, adapt to change, and engage with diverse perspectives.',
              'Additionally, higher education provides opportunities for personal growth, exposure to new ideas, and the development of a broader worldview. These intangible benefits, while difficult to quantify, represent significant value for many graduates.'
            ]
          },
          {
            id: 'field-variation',
            title: 'Variation by Field of Study',
            content: [
              'The value of a college degree varies significantly depending on the field of study. STEM fields (Science, Technology, Engineering, and Mathematics) continue to show the highest earning potential and strongest job market demand. Engineering and computer science graduates, in particular, command premium salaries and enjoy excellent employment prospects.',
              'Business and healthcare degrees also demonstrate strong value, with graduates finding good employment opportunities and competitive salaries. These fields benefit from consistent demand and clear career pathways.',
              'Degrees in the humanities, social sciences, and arts show more variable outcomes. While graduates in these fields may earn less on average, they often report high levels of job satisfaction and find value in the transferable skills their education provides. The critical thinking, communication, and analytical abilities developed in these programs are highly valued by many employers.'
            ]
          },
          {
            id: 'conclusion',
            title: 'Conclusion',
            content: [
              'The value of a college degree in 2025 remains significant, though it is more nuanced than in previous decades. While economic returns continue to favor degree holders, the value proposition varies by field of study, individual circumstances, and career goals. Students and families must carefully consider their specific situations when evaluating the investment in higher education.',
              'As the educational landscape continues to evolve, the value of degrees will likely be measured not just by traditional metrics, but also by their ability to provide adaptable skills, professional networks, and opportunities for lifelong learning. The most valuable degrees in 2025 are those that combine strong economic returns with the development of transferable skills and critical thinking abilities.',
              'Ultimately, while alternative pathways are emerging, college degrees continue to provide substantial value for most students. The key is making informed choices about field of study, institution, and career goals to maximize both financial and personal returns on the educational investment.'
            ]
          }
        ],
        references: [
          'Bureau of Labor Statistics. (2025). Education pays: Earnings and unemployment rates by educational attainment. U.S. Department of Labor.',
          'Carnevale, A. P., Cheah, B., & Wenzinger, E. (2024). The College Payoff: More Education Doesn\'t Always Mean More Earnings. Georgetown University Center on Education and the Workforce.',
          'Oreopoulos, P., & Petronijevic, U. (2023). Making College Worth It: A Review of Research on the Returns to Higher Education. National Bureau of Economic Research.',
          'Abel, J. R., & Deitz, R. (2024). The Value of a College Degree. Federal Reserve Bank of New York.',
          'Deming, D. J. (2024). The Growing Importance of Social Skills in the Labor Market. Quarterly Journal of Economics, 132(4), 1593-1640.'
        ]
      },
      visualizations: [
        {
          type: 'bar',
          title: 'Median Weekly Earnings by Education Level (2025)',
          data: [
            { name: 'High School', 'Median Earnings ($)': 800 },
            { name: 'Some College', 'Median Earnings ($)': 950 },
            { name: 'Bachelor\'s Degree', 'Median Earnings ($)': 1300 },
            { name: 'Master\'s Degree', 'Median Earnings ($)': 1550 },
            { name: 'Doctoral Degree', 'Median Earnings ($)': 1900 }
          ],
          config: {
            xKey: 'name',
            bars: [{ dataKey: 'Median Earnings ($)', name: 'Median Weekly Earnings ($)' }],
            description: 'Comparison of median weekly earnings across different education levels'
          }
        },
        {
          type: 'line',
          title: 'Unemployment Rate by Education Level Over Time',
          data: [
            { year: '2020', 'High School': 6.5, 'Bachelor\'s': 3.2 },
            { year: '2021', 'High School': 5.8, 'Bachelor\'s': 2.9 },
            { year: '2022', 'High School': 4.9, 'Bachelor\'s': 2.4 },
            { year: '2023', 'High School': 4.2, 'Bachelor\'s': 2.1 },
            { year: '2024', 'High School': 3.8, 'Bachelor\'s': 1.9 },
            { year: '2025', 'High School': 3.5, 'Bachelor\'s': 1.7 }
          ],
          config: {
            xKey: 'year',
            lines: [
              { dataKey: 'High School', name: 'High School (%)' },
              { dataKey: 'Bachelor\'s', name: 'Bachelor\'s Degree (%)' }
            ],
            description: 'Unemployment rates showing the advantage of higher education'
          }
        },
        {
          type: 'pie',
          title: 'Lifetime Earnings Premium by Degree Type',
          data: [
            { name: 'STEM Fields', value: 35 },
            { name: 'Business', value: 25 },
            { name: 'Healthcare', value: 20 },
            { name: 'Social Sciences', value: 12 },
            { name: 'Humanities', value: 8 }
          ],
          config: {
            dataKey: 'value',
            nameKey: 'name',
            description: 'Distribution of lifetime earnings premium across different degree fields'
          }
        }
      ],
      metadata: {
        methodology: 'Quantitative Analysis',
        sampleSize: '50,000+ graduates, 5,000+ employers',
        duration: '10 years',
        researchStatus: 'Ongoing'
      },
      relatedTopics: [
        { id: 2, title: 'The Shift from Degrees to Skills', category: 'Career Development' },
        { id: 4, title: 'Micro-Credentials: The Future of Fast Learning', category: 'Learning' },
        { id: 1, title: 'AI in Education', category: 'Technology' }
      ],
      comments: [
        {
          id: 1,
          author: { name: 'Dr. Robert Martinez', avatar: '/images/placeholder.svg' },
          content: 'This research provides valuable insights into the evolving value proposition of higher education. The data on field variation is particularly important for students making decisions about their educational investments.',
          createdAt: '2024-01-11T09:30:00Z',
          replies: [
            {
              id: 2,
              author: { name: 'Elena M. Calder', avatar: '/images/placeholder.svg' },
              content: 'Thank you for your feedback. Field variation is indeed crucial, and we hope this data helps students make more informed decisions about their educational paths.',
              createdAt: '2024-01-11T10:15:00Z'
            }
          ]
        },
        {
          id: 3,
          author: { name: 'Prof. Sarah Chen', avatar: '/images/placeholder.svg' },
          content: 'The analysis of non-financial benefits is particularly valuable. Too often, discussions about degree value focus solely on earnings, overlooking the broader benefits of higher education.',
          createdAt: '2024-01-12T14:20:00Z',
          replies: []
        },
        {
          id: 4,
          author: { name: 'Dr. Michael Thompson', avatar: '/images/placeholder.svg' },
          content: 'As a career counselor, I find the field variation data extremely useful. This helps me guide students toward fields that align with both their interests and economic realities.',
          createdAt: '2024-01-13T11:00:00Z',
          replies: []
        }
      ]
    }
  }

  useEffect(() => {
    const loadTopic = async () => {
      try {
        setLoading(true)
        // Try to fetch from API first
        try {
          const topicData = await topicsAPI.getById(id)
          
          // Transform API data to match expected format
          const transformedTopic = {
            id: topicData.id,
            title: topicData.title,
            description: topicData.description,
            abstract: topicData.abstract,
            author: {
              name: topicData.user_name || 'Unknown Author',
              avatar: '/images/placeholder.svg',
              title: '',
              bio: topicData.author_bio || ''
            },
            category: topicData.category || 'Uncategorized',
            tags: Array.isArray(topicData.tags) ? topicData.tags : [],
            votes: topicData.votes || 0,
            commentsCount: topicData.comment_count || topicData.comments || 0,
            views: topicData.views || 0,
            readTime: topicData.read_time || 5,
            status: topicData.status || 'Active',
            createdAt: topicData.created_at || new Date().toISOString(),
            image: topicData.image || '/images/placeholder.svg',
            content: topicData.content || { sections: [], references: [] },
            visualizations: topicData.visualizations || [],
            relatedTopics: [],
            comments: []
          }
          
          setTopic(transformedTopic)
        } catch (apiError) {
          // Fallback to mock data if API fails
          console.warn('API fetch failed, using mock data:', apiError)
          const topicData = mockTopics[id] || mockTopics['1']
          if (topicData) {
            const safeTopicData = {
              ...topicData,
              id: id, // Use the actual ID from URL
              author: {
                name: topicData.author?.name || 'Unknown Author',
                avatar: topicData.author?.avatar || '/images/placeholder.svg',
                title: topicData.author?.title || '',
                bio: topicData.author?.bio || ''
              },
              tags: topicData.tags || [],
              votes: topicData.votes || 0,
              commentsCount: Array.isArray(topicData.comments) ? topicData.comments.length : (typeof topicData.comments === 'number' ? topicData.comments : 0),
              views: topicData.views || 0,
              readTime: topicData.readTime || 5,
              status: topicData.status || 'Active',
              category: topicData.category || 'Uncategorized',
              createdAt: topicData.createdAt || new Date().toISOString(),
              image: topicData.image || '/images/placeholder.svg',
              content: topicData.content || { sections: [], references: [] },
              visualizations: topicData.visualizations || [],
              relatedTopics: topicData.relatedTopics || [],
              comments: Array.isArray(topicData.comments) ? topicData.comments : []
            }
            setTopic(safeTopicData)
          }
        }
      } catch (error) {
        console.error('Error loading topic:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTopic()
  }, [id])

  const handleBack = () => {
    navigate('/topics')
  }

  if (loading || !topic) {
    return (
      <div className="topic-detail-page">
        <Header />
        <main className="topic-detail-main">
          <div className="topic-detail-container">
            <LoadingSpinner size="large" message="Loading topic..." />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Safely extract data with fallbacks
  const articleSections = topic.content?.sections || []
  const visualizations = topic.visualizations || []
  const contentBlocks = topic.content_blocks || topic.contentBlocks || []
  const relatedTopics = topic.relatedTopics || []
  const customization = topic.customization_settings || topic.customizationSettings || {
    typography: { fontSize: 'medium', lineHeight: 'normal', fontFamily: 'serif', textWidth: 'medium' },
    layout: 'classic',
    colorScheme: 'academic-blue' // Professional color scheme (fixed)
  }
  
  // If no sections, show the description as fallback
  const hasFullArticle = articleSections.length > 0

  // Helper to render content blocks
  const renderContentBlock = (block) => {
    if (block.type === 'pullQuote' && block.quote) {
      return <PullQuote key={block.id} quote={block.quote} author={block.author} alignment={block.alignment} />
    }
    if (block.type === 'ctaBox' && (block.title || block.description)) {
      return <CTABox key={block.id} title={block.title} description={block.description} buttonText={block.buttonText} buttonLink={block.buttonLink} variant={block.variant} />
    }
    if (block.type === 'infoBox' && block.content) {
      return <InfoBox key={block.id} type={block.boxType} title={block.title} content={block.content} />
    }
    if (block.type === 'codeBlock' && block.code) {
      return <CodeBlock key={block.id} code={block.code} language={block.language} showLineNumbers={block.showLineNumbers} />
    }
    if (block.type === 'imageGallery' && block.images && block.images.some(img => img)) {
      return <ImageGallery key={block.id} images={block.images.filter(img => img)} captions={block.captions || []} layout={block.layout} />
    }
    return null
  }

  return (
    <div className="topic-detail-page" data-color-scheme={customization.colorScheme}>
      <ReadingProgress />
      <Header />
      <main className="topic-detail-main">
        <div className="topic-detail-container">
          <button className="back-button" onClick={handleBack}>
            ← Back to Topics
          </button>

          <div className="topic-layout">
            <div className="topic-main-content">
              <article 
                className={`topic-article topic-layout-${customization.layout}`}
                style={{
                  fontSize: customization.typography?.fontSize === 'small' ? '14px' : 
                            customization.typography?.fontSize === 'medium' ? '16px' :
                            customization.typography?.fontSize === 'large' ? '18px' : '20px',
                  lineHeight: customization.typography?.lineHeight === 'tight' ? '1.5' :
                             customization.typography?.lineHeight === 'normal' ? '1.7' : '1.9',
                  maxWidth: customization.typography?.textWidth === 'narrow' ? '800px' :
                           customization.typography?.textWidth === 'medium' ? '1000px' :
                           customization.typography?.textWidth === 'wide' ? '1200px' : '100%',
                  fontFamily: customization.typography?.fontFamily === 'serif' ? 'Georgia, "Times New Roman", serif' :
                             customization.typography?.fontFamily === 'sans-serif' ? 'Inter, system-ui, sans-serif' :
                             customization.typography?.fontFamily === 'monospace' ? '"Courier New", Courier, monospace' :
                             'Georgia, "Times New Roman", serif',
                  margin: '0 auto'
                }}
              >
                <div className="topic-header">
                  <div className="topic-meta-top">
                    <div className="topic-author-info" style={{ position: 'relative' }}>
                      <LazyImage src={topic.author.avatar} alt={topic.author.name} className="author-avatar-large" />
                      <div>
                        <p className="author-name-large">{topic.author.name}</p>
                        <p className="author-title">{topic.author.title}</p>
                      </div>
                    </div>
                    <span className={`topic-status-badge status-${topic.status.toLowerCase()}`}>
                      {topic.status}
                    </span>
                  </div>

                  <h1 className="topic-title-large">{topic.title}</h1>
                  
                  <div className="topic-tags-large">
                    {topic.tags.map((tag, index) => (
                      <span key={index} className="topic-tag-large">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="topic-image-container" style={{ position: 'relative' }}>
                  <LazyImage src={topic.image} alt={topic.title} className="topic-image-large" />
                </div>

                <div className="topic-content">
                  {/* Yes/No Voting Component */}
                  <YesNoVote 
                    propositionId={topic.id} 
                    propositionType="topic"
                  />
                  
                  <div className="topic-stats-bar">
                    <div className="stat-item-large">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>{topic.commentsCount || (Array.isArray(topic.comments) ? topic.comments.length : 0)} Comments</span>
                    </div>
                    <div className="stat-item-large">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>{topic.views} Views</span>
                    </div>
                    <div className="stat-item-large">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                      <span>{topic.readTime} min read</span>
                    </div>
                    <div className="export-menu-wrapper">
                      <ExportMenu topic={topic} />
                    </div>
                    <BookmarkButton topicId={topic.id} className="inline" />
                  </div>

                  {topic.abstract && (
                    <div className="article-abstract">
                      <h2 className="abstract-title">Abstract</h2>
                      <p className="abstract-content">{topic.abstract}</p>
                    </div>
                  )}

                  {!hasFullArticle && (topic.fullDescription || topic.description) && (
                    <div className="topic-description-full">
                      <p>{topic.fullDescription || topic.description}</p>
                    </div>
                  )}

                  {hasFullArticle && articleSections.length > 0 && (
                    <>
                      {articleSections.map((section, index) => {
                        // Place visualizations after every 2 sections
                        const shouldShowViz = index > 0 && (index + 1) % 3 === 0
                        const vizIndex = shouldShowViz ? Math.floor((index + 1) / 3) - 1 : -1
                        
                        // Get content blocks for this section
                        const sectionBlocks = contentBlocks.filter(b => 
                          b.position === 'after-section' || (!b.position && index === articleSections.length - 1)
                        )
                        
                        return (
                          <React.Fragment key={section.id}>
                            <ArticleSection
                              id={section.id}
                              title={section.title}
                              content={section.content}
                              level={2}
                            />
                            {shouldShowViz && vizIndex >= 0 && vizIndex < visualizations.length && (
                              <Visualization
                                type={visualizations[vizIndex].type}
                                title={visualizations[vizIndex].title}
                                data={visualizations[vizIndex].data}
                                config={visualizations[vizIndex].config}
                              />
                            )}
                            {/* Render content blocks after section */}
                            {sectionBlocks.map(block => renderContentBlock(block))}
                          </React.Fragment>
                        )
                      })}
                      {/* Render content blocks that appear after all sections */}
                      {contentBlocks
                        .filter(b => b.position === 'after-all' || (!b.position && articleSections.length === 0))
                        .map(block => renderContentBlock(block))}
                    </>
                  )}

                  {visualizations.length > 0 && !hasFullArticle && (
                    <div className="visualizations-section">
                      <h2 className="section-title">Data & Visualizations</h2>
                      {visualizations.map((viz, index) => (
                        <Visualization
                          key={index}
                          type={viz.type}
                          title={viz.title}
                          data={viz.data}
                          config={viz.config}
                        />
                      ))}
                    </div>
                  )}

                  {hasFullArticle && topic.content?.references && topic.content.references.length > 0 && (
                    <section id="references" className="references-section">
                      <h2 className="references-title">References</h2>
                      <ol className="references-list">
                        {topic.content.references.map((ref, index) => (
                          <li key={index} className="reference-item">{ref}</li>
                        ))}
                      </ol>
                    </section>
                  )}

                  {hasFullArticle && topic.author?.bio && (
                    <section id="author-bio" className="author-bio-section">
                      <h2 className="author-bio-title">About the Author</h2>
                      <div className="author-bio-content">
                        <img 
                          src={topic.author.avatar || '/images/placeholder.svg'} 
                          alt={topic.author.name}
                          className="author-bio-avatar"
                        />
                        <div className="author-bio-text">
                          <h3 className="author-bio-name">{topic.author.name}</h3>
                          {topic.author.title && (
                            <p className="author-bio-title-text">{topic.author.title}</p>
                          )}
                          <p className="author-bio-description">{topic.author.bio}</p>
                        </div>
                      </div>
                    </section>
                  )}

                  <CommentsSection 
                    topicId={topic.id} 
                    comments={topic.comments || []}
                  />
                </div>
              </article>
            </div>

            <aside className="topic-sidebar">
              {hasFullArticle && articleSections.length > 0 && (
                <TableOfContents sections={articleSections} />
              )}
              <ArticleMeta topic={topic} />
              <ExportMenu topic={topic} />
              <ShareButtons title={topic.title} url={typeof window !== 'undefined' ? window.location.href : ''} />
              {relatedTopics.length > 0 && (
                <RelatedTopics topics={relatedTopics} />
              )}
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TopicDetailPage

