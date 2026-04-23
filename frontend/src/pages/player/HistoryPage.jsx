import { useState, useEffect } from 'react'
import api from '../../api'
import PlayerLayout from '../../components/PlayerLayout'

export default function HistoryPage() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/quiz/history').then(({ data }) => {
      setSessions(data.data)
      setLoading(false)
    })
  }, [])

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
  }

  const formatTime = (s) => {
    if (!s) return '—'
    return Math.floor(s / 60) > 0 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`
  }

  return (
    <PlayerLayout>
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📋 Mon historique</h1>
          <p className="text-gray-500 mt-1">Vos parties récentes</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
          </div>
        ) : sessions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-3">🎮</div>
            <p className="text-gray-500">Aucune partie jouée pour l'instant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => {
              const pct = s.total_questions > 0
                ? Math.round((s.correct_answers / s.total_questions) * 100)
                : 0
              return (
                <div key={s.id} className="card flex items-center gap-4">
                  <div className="text-3xl">{s.category?.icon || '📚'}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{s.category?.name}</p>
                    <p className="text-xs text-gray-400">{formatDate(s.created_at)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">{s.correct_answers}/{s.total_questions}</p>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1">
                      <div
                        className={`h-1.5 rounded-full ${pct >= 70 ? 'bg-green-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{pct}%</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">{s.score} pts</p>
                    <p className="text-xs text-gray-400">{formatTime(s.time_taken)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </PlayerLayout>
  )
}
