import { useState, useEffect } from 'react'
import api from '../../api'

export default function AdminUsers() {
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [page,    setPage]    = useState(1)
  const [pagination, setPag]  = useState(null)

  const load = (p = 1) => {
    setLoading(true)
    api.get(`/admin/users?page=${p}`).then(({ data }) => {
      setUsers(data.data)
      setPag(data)
      setLoading(false)
    })
  }

  useEffect(() => { load(page) }, [page])

  const formatDate = (d) => new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">
          {pagination ? `${pagination.total} joueur(s) inscrit(s)` : '—'}
        </p>
      </div>

      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Joueur</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Email</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Score total</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Parties</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Inscrit le</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-5 py-4">
                  <div className="h-5 bg-gray-100 rounded animate-pulse" />
                </td></tr>
              ))
            ) : users.map((u, idx) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{u.name}</p>
                      {(pagination?.from ?? 0) + idx === 0 && (
                        <span className="text-xs text-amber-500">🥇 Meilleur joueur</span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-center font-bold text-indigo-600">
                  {u.total_score.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{u.games_played}</td>
                <td className="px-4 py-3 text-gray-400 hidden lg:table-cell">{formatDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && users.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">👥</div>
            <p>Aucun utilisateur inscrit.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {pagination.current_page} / {pagination.last_page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">← Précédent</button>
            <button onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))} disabled={page === pagination.last_page} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Suivant →</button>
          </div>
        </div>
      )}
    </div>
  )
}