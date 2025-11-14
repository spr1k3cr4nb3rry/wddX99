import React, { Suspense, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import LoadingSpinner from './components/common/LoadingSpinner/LoadingSpinner'
import './styles/index.css'

// Lazy load pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'))
const TopicsPage = React.lazy(() => import('./pages/TopicsPage'))
const TopicDetailPage = React.lazy(() => import('./pages/TopicDetailPage'))
const CreateTopicPage = React.lazy(() => import('./pages/CreateTopicPage'))
const EditTopicPage = React.lazy(() => import('./pages/EditTopicPage'))
const MyTopicsPage = React.lazy(() => import('./pages/MyTopicsPage'))
const AdminPanel = React.lazy(() => import('./pages/AdminPanel'))
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'))
const AnalyticsPage = React.lazy(() => import('./pages/AnalyticsPage'))
const BookmarksPage = React.lazy(() => import('./pages/BookmarksPage'))
const ContributorDetailPage = React.lazy(() => import('./pages/ContributorDetailPage'))
const AboutPage = React.lazy(() => import('./pages/AboutPage'))
const ResourcesPage = React.lazy(() => import('./pages/ResourcesPage'))
const VotingFiltersPage = React.lazy(() => import('./pages/VotingFiltersPage'))
const SurveyBuilderPage = React.lazy(() => import('./pages/SurveyBuilderPage'))
const ResearchProposalsPage = React.lazy(() => import('./pages/ResearchProposalsPage'))
const WhitepaperLibraryPage = React.lazy(() => import('./pages/WhitepaperLibraryPage'))
const WhitepaperDetailPage = React.lazy(() => import('./pages/WhitepaperDetailPage'))
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'))

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <Suspense fallback={<LoadingSpinner fullScreen={true} message="Loading page..." />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/topics/create" element={<CreateTopicPage />} />
            <Route path="/topics/edit/:id" element={<EditTopicPage />} />
            <Route path="/my-topics" element={<MyTopicsPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            <Route path="/analytics/user/:userId" element={<AnalyticsPage />} />
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/topic/:id" element={<TopicDetailPage />} />
            <Route path="/contributor/:id" element={<ContributorDetailPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/voting/filters" element={<VotingFiltersPage />} />
            <Route path="/surveys/create" element={<SurveyBuilderPage />} />
            <Route path="/research-proposals" element={<ResearchProposalsPage />} />
            <Route path="/whitepapers" element={<WhitepaperLibraryPage />} />
            <Route path="/whitepapers/:id" element={<WhitepaperDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App

