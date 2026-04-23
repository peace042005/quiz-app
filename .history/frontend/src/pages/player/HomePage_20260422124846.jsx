import { Link } from 'react-router-dom'
import useAuthStore from '../../store/authStore'
import PlayerLayout from '../../components/PlayerLayout'

export default function HomePage() {
  const { user } = useAuthStore()

  const stats = [
    { label: 'Score total',   value: user?.total_score ?? 0, icon: '⭐' },
    { label: 'Parties jouées',value: user?.games_played ?? 0, icon: '🎮' },
    { label: 'Meilleur rang', value: '#—',                    icon: '🏆' },
  ]

  return (
    <PlayerLayout>
      <div className="animate-fade-in space-y-8">
        {/* Hero */}
        <div className="card bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="text-6xl">🧠</div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Bonjour, {user?.name} ! 👋</h1>
              <p className="text-indigo-100 mb-4">Prêt à tester vos connaissances ? Choisissez une catégorie et commencez à jouer !</p>
              <Link to="/categories" className="inline-block bg-white text-indigo-600 font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors">
                Jouer maintenant ▶️
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-2xl font-bold text-gray-800">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Actions rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/categories',  icon: '🎯', title: 'Nouvelle partie',  desc: 'Choisir une catégorie et jouer', color: 'from-indigo-500 to-purple-500' },
              { to: '/leaderboard', icon: '🏆', title: 'Classement',       desc: 'Voir les meilleurs joueurs',     color: 'from-amber-400 to-orange-500' },
              { to: '/history',     icon: '📋', title: 'Mon historique',   desc: 'Revoir mes parties passées',     color: 'from-teal-400 to-green-500' },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`card border-0 text-white bg-gradient-to-br ${item.color} hover:shadow-lg transition-shadow group cursor-pointer`}
              >
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{item.icon}</div>
                <h3 className="font-bold mb-1">{item.title}</h3>
                <p className="text-sm opacity-90">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PlayerLayout>
  )
}
