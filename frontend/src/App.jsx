import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import BookCatalog from './pages/BookCatalog'
import BookDetail from './pages/BookDetail'
import DiscussionThread from './pages/DiscussionThread'
import Forums from './pages/Forums'
import ForumDetail from './pages/ForumDetail'
import ForumPost from './pages/ForumPost'
import LiveRooms from './pages/LiveRooms'
import LiveRoom from './pages/LiveRoom'
import Profile from './pages/Profile'
import { useAuthStore } from './store/authStore'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0f0f1a]">
      <ErrorBoundary>
        <Routes>
          {/* Auth routes without Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main app with Navbar */}
          <Route path="/*" element={
            <>
              <Navbar />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/books" element={<BookCatalog />} />
                <Route path="/books/:id" element={<BookDetail />} />
                <Route path="/books/:id/discussions/:discussionId" element={<DiscussionThread />} />
                <Route path="/forums" element={<Forums />} />
                <Route path="/forums/:name" element={<ForumDetail />} />
                <Route path="/forums/:name/posts/:id" element={<ForumPost />} />
                <Route path="/rooms" element={<LiveRooms />} />
                <Route path="/rooms/:id" element={<LiveRoom />} />
                <Route path="/users/:id" element={<Profile />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </>
          } />
        </Routes>
      </ErrorBoundary>
    </div>
  )
}
