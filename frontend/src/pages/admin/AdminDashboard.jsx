import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

export default function AdminDashboard() {
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => {
      setData(data)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-gray-200 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-gray-200 rounded-2xl" />
      </div>
    )
  }

  const statCards = [
    { label: 'Utilisateurs',  value: data.stats.total_users,      icon: '👥', color: 'from-blue-500 to-blue-600',    to: '/admin/users' },
    { label: 'Questions',     value: data.stats.total_questions,   icon: '❓', color: 'from-purple-500 to-purple-600', to: '/admin/questions' },
    { label: 'Catégories',    value: data.stats.total_categories,  icon: '📁', color: 'from-teal-500 to-teal-600',    to: '/admin/categories' },
    { label: 'Parties jouées',value: data.stats.total_games,       icon: '🎮', color: 'from-orange-500 to-orange-600', to: null },
  ]

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="text-gray-500 text-sm mt-1">Vue d'ensemble de QuizMaster</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Inner = (
            <div className={`card bg-gradient-to-br ${s.color} text-white border-0 hover:shadow-lg transition-shadow`}>
              <div className="text-3xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value.toLocaleString()}</div>
              <div className="text-sm opacity-80 mt-0.5">{s.label}</div>
            </div>
          )
          return s.to ? <Link key={s.label} to={s.to}>{Inner}</Link> : <div key={s.label}>{Inner}</div>
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parties récentes */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Parties récentes</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recent_games.length === 0 ? (
              <p className="p-5 text-sm text-gray-400 text-center">Aucune partie pour l'instant.</p>
            ) : (
              data.recent_games.map((g) => (
                <div key={g.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 flex-shrink-0">
                    {g.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{g.user?.name}</p>
                    <p className="text-xs text-gray-400">{g.category?.name} · {formatDate(g.created_at)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-indigo-600">{g.score} pts</p>
                    <p className="text-xs text-gray-400">
                      {g.correct_answers}/{g.total_questions}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top joueurs */}
        <div className="card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-800">🏆 Top joueurs</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.top_players.map((p, idx) => (
              <div key={p.id} className="px-5 py-3 flex items-center gap-3">
                <span className="text-xl w-7 text-center">{['🥇','🥈','🥉','4️⃣','5️⃣'][idx]}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.games_played} parties</p>
                </div>
                <p className="text-sm font-bold text-indigo-600">{p.total_score.toLocaleString()} pts</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Raccourcis */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Actions rapides</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/questions/new"  className="btn-primary text-sm">➕ Nouvelle question</Link>
          <Link to="/admin/categories"     className="btn-secondary text-sm">📁 Gérer catégories</Link>
          <Link to="/admin/questions"      className="btn-secondary text-sm">📋 Toutes les questions</Link>
        </div>
      </div>
    </div>
  )
}