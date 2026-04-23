import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import useAuthStore from './store/authStore'

// Pages publiques
import LoginPage     from './pages/LoginPage'
import RegisterPage  from './pages/RegisterPage'

// Pages joueur
import HomePage        from './pages/player/HomePage'
import CategoryPage    from './pages/player/CategoryPage'
import QuizPage        from './pages/player/QuizPage'
import ResultPage      from './pages/player/ResultPage'
import LeaderboardPage from './pages/player/LeaderboardPage'
import HistoryPage     from './pages/player/HistoryPage'

// Pages admin
import AdminLayout       from './pages/admin/AdminLayout'
import AdminDashboard    from './pages/admin/AdminDashboard'
import AdminCategories   from './pages/admin/AdminCategories'
import AdminQuestions    from './pages/admin/AdminQuestions'
import AdminQuestionForm from './pages/admin/AdminQuestionForm'
import AdminUsers        from './pages/admin/AdminUsers'

// Guards
function PrivateRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  if (!user) return <Navigate to="/login" />
  return user.role === 'admin' ? children : <Navigate to="/" />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuthStore()
  if (loading) return <Loader />
  return !user ? children : <Navigate to="/" />
}

function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  )
}

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe)
  useEffect(() => { fetchMe() }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Joueur */}
        <Route path="/"             element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/categories"   element={<PrivateRoute><CategoryPage /></PrivateRoute>} />
        <Route path="/quiz/:id"     element={<PrivateRoute><QuizPage /></PrivateRoute>} />
        <Route path="/result"       element={<PrivateRoute><ResultPage /></PrivateRoute>} />
        <Route path="/leaderboard"  element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
        <Route path="/history"      element={<PrivateRoute><HistoryPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index                         element={<AdminDashboard />} />
          <Route path="categories"             element={<AdminCategories />} />
          <Route path="questions"              element={<AdminQuestions />} />
          <Route path="questions/new"          element={<AdminQuestionForm />} />
          <Route path="questions/:id/edit"     element={<AdminQuestionForm />} />
          <Route path="users"                  element={<AdminUsers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}