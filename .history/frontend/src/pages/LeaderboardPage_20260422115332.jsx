import { useState, useEffect } from 'react'
import api from '../../api'
import useAuthStore from '../../store/authStore'
import PlayerLayout from '../../components/PlayerLayout'

export default function LeaderboardPage() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user }              = useAuthStore()

  useEffect(() => {
    api.get('/leaderboard').then(({ data }) => {
      setPlayers(data)
      setLoading(false)
    })
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <PlayerLayout>
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">🏆 Classement</h1>
          <p className="text-gray-500 mt-1">Les 20 meilleurs joueurs de QuizMaster</p>
        </div>

        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div>
              {players.map((player, idx) => {
                const isMe = player.name === user?.name
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0 transition-colors ${
                      isMe ? 'bg-indigo-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 text-center">
                      {idx < 3 ? (
                        <span className="text-2xl">{medals[idx]}</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-400">#{player.rank}</span>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {player.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className={`font-semibold ${isMe ? 'text-indigo-700' : 'text-gray-800'}`}>
                        {player.name} {isMe && <span className="text-xs font-normal">(moi)</span>}
                      </p>
                      <p className="text-xs text-gray-400">{player.games_played} parties jouées</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{player.total_score.toLocaleString()}</p>
                      <p className="text-xs text-indigo-500">points</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PlayerLayout>
  )
}