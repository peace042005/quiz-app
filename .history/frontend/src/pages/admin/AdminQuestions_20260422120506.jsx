import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api'

export default function AdminQuestions() {
  const [questions,   setQuestions]   = useState([])
  const [categories,  setCategories]  = useState([])
  const [pagination,  setPagination]  = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [filters,     setFilters]     = useState({ category_id: '', difficulty: '', search: '' })
  const [page,        setPage]        = useState(1)
  const [deleting,    setDeleting]    = useState(null)

  const load = useCallback((p = 1) => {
    setLoading(true)
    const params = new URLSearchParams({ page: p, ...filters })
    Object.keys(filters).forEach(k => { if (!filters[k]) params.delete(k) })
    api.get(`/admin/questions?${params}`).then(({ data }) => {
      setQuestions(data.data)
      setPagination(data)
      setLoading(false)
    })
  }, [filters])

  useEffect(() => { api.get('/admin/categories').then(({ data }) => setCategories(data)) }, [])
  useEffect(() => { load(pages) }, [pages, filters])

  const handleDelete = async (q) => {
    if (!confirm(`Supprimer la question "${q.question_text.slice(0, 50)}..." ?`)) return
    setDeleting(q.id)
    await api.delete(`/admin/questions/${q.id}`)
    load(page)
    setDeleting(null)
  }

  const diffLabel = { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-gray-500 text-sm mt-1">
            {pagination ? `${pagination.total} question(s) au total` : '—'}
          </p>
        </div>
        <Link to="/admin/questions/new" className="btn-primary">➕ Nouvelle question</Link>
      </div>

      {/* Filtres */}
      <div className="card py-4 flex flex-wrap gap-3">
        <input
          className="input flex-1 min-w-40 text-sm"
          placeholder="🔍 Rechercher..."
          value={filters.search}
          onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1) }}
        />
        <select
          className="input w-44 text-sm"
          value={filters.category_id}
          onChange={e => { setFilters(f => ({ ...f, category_id: e.target.value })); setPage(1) }}
        >
          <option value="">Toutes catégories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select
          className="input w-36 text-sm"
          value={filters.difficulty}
          onChange={e => { setFilters(f => ({ ...f, difficulty: e.target.value })); setPage(1) }}
        >
          <option value="">Toute difficulté</option>
          <option value="easy">Facile</option>
          <option value="medium">Moyen</option>
          <option value="hard">Difficile</option>
        </select>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Question</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Catégorie</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Difficulté</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Points</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Réponses</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4">
                  <div className="h-5 bg-gray-100 rounded animate-pulse" />
                </td></tr>
              ))
            ) : questions.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 max-w-sm">
                  <p className="font-medium text-gray-800 line-clamp-2">{q.question_text}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    ⏱ {q.time_limit}s
                    {q.is_active ? '' : ' · '}
                    {!q.is_active && <span className="text-red-400">Inactive</span>}
                  </p>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  <span className="text-gray-600">{q.category?.icon} {q.category?.name}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`badge-${q.difficulty}`}>{diffLabel[q.difficulty]}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-700 font-medium hidden md:table-cell">
                  {q.points}
                </td>
                <td className="px-4 py-3 text-center text-gray-500 hidden md:table-cell">
                  {q.answers?.length ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <Link to={`/admin/questions/${q.id}/edit`} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                      Modifier
                    </Link>
                    <button
                      onClick={() => handleDelete(q)}
                      disabled={deleting === q.id}
                      className="text-red-500 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === q.id ? '...' : 'Supprimer'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && questions.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">❓</div>
            <p>Aucune question trouvée.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {pagination.current_page} / {pagination.last_page}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
            >← Précédent</button>
            <button
              onClick={() => setPage(p => Math.min(pagination.last_page, p + 1))}
              disabled={page === pagination.last_page}
              className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40"
            >Suivant →</button>
          </div>
        </div>
      )}
    </div>
  )
}