import { useLocation, useNavigate, Link } from 'react-router-dom'
import PlayerLayout from '../../components/PlayerLayout'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const result   = location.state?.result
  const category = location.state?.category

  if (!result) {
    navigate('/')
    return null
  }

  const { score, correct_answers, total_questions, percentage, time_taken } = result

  const getMedal = () => {
    if (percentage >= 90) return { emoji: '🥇', label: 'Excellent !',      color: 'text-amber-500' }
    if (percentage >= 70) return { emoji: '🥈', label: 'Très bien !',      color: 'text-slate-400' }
    if (percentage >= 50) return { emoji: '🥉', label: 'Pas mal !',        color: 'text-amber-700' }
    return                       { emoji: '📚', label: 'À améliorer',       color: 'text-gray-400' }
  }

  const medal = getMedal()

  const formatTime = (seconds) => {
    if (!seconds) return '—'
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}m ${s}s` : `${s}s`
  }

  return (
    <PlayerLayout>
      <div className="max-w-lg mx-auto animate-bounce-in">
        {/* Médaille et score */}
        <div className="card text-center mb-6">
          <div className="text-7xl mb-3">{medal.emoji}</div>
          <h1 className={`text-2xl font-bold mb-1 ${medal.color}`}>{medal.label}</h1>
          <p className="text-gray-500 mb-4">
            Catégorie : <span className="font-medium">{category?.icon} {category?.name}</span>
          </p>

          {/* Cercle de score */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke={percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - percentage / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{percentage}%</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-indigo-600">{score}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-green-600">{correct_answers}/{total_questions}</div>
              <div className="text-xs text-gray-500">Bonnes réponses</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-2xl font-bold text-gray-700">{formatTime(time_taken)}</div>
              <div className="text-xs text-gray-500">Temps total</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link to="/categories" className="btn-primary text-center">
            🔄 Rejouer
          </Link>
          <Link to="/leaderboard" className="btn-secondary text-center">
            🏆 Voir le classement
          </Link>
          <Link to="/" className="text-center text-sm text-gray-500 hover:text-gray-700">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </PlayerLayout>
  )
}