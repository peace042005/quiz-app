import { useState, useEffect } from 'react'
import api from '../../api'

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899']
const EMPTY  = { name: '', description: '', icon: '', color: '#6366f1', is_active: true }

export default function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // null | 'create' | category object
  const [form, setForm]             = useState(EMPTY)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const load = () => {
    setLoading(true)
    api.get('/admin/categories').then(({ data }) => {
      setCategories(data)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setForm(EMPTY)
    setError('')
    setModal('create')
  }

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', icon: cat.icon || '', color: cat.color, is_active: cat.is_active })
    setError('')
    setModal(cat)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Le nom est requis.'); return }
    setSaving(true)
    setError('')
    try {
      if (modal === 'create') {
        await api.post('/admin/categories', form)
      } else {
        await api.put(`/admin/categories/${modal.id}`, form)
      }
      setModal(null)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (cat) => {
    if (!confirm(`Supprimer "${cat.name}" et toutes ses questions ?`)) return
    await api.delete(`/admin/categories/${cat.id}`)
    load()
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} catégorie(s) au total</p>
        </div>
        <button onClick={openCreate} className="btn-primary">➕ Nouvelle catégorie</button>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Catégorie</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600 hidden md:table-cell">Description</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Questions</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Statut</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={5} className="px-5 py-4">
                    <div className="h-6 bg-gray-100 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: cat.color + '22' }}
                    >
                      {cat.icon || '📚'}
                    </div>
                    <span className="font-medium text-gray-800">{cat.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                  {cat.description || '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-medium text-gray-700">{cat.questions_count}</span>
                  <span className="text-gray-400 text-xs ml-1">({cat.active_questions_count} actives)</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {cat.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(cat)} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">Modifier</button>
                    <button onClick={() => handleDelete(cat)} className="text-red-500 hover:text-red-700 text-sm font-medium">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!loading && categories.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <div className="text-4xl mb-2">📁</div>
            <p>Aucune catégorie. Créez-en une !</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-bounce-in">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-800">
                {modal === 'create' ? 'Nouvelle catégorie' : `Modifier "${modal.name}"`}
              </h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {error && <p className="text-red-600 text-sm bg-red-50 p-2 rounded-lg">{error}</p>}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Informatique" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description de la catégorie..." />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icône (emoji)</label>
                  <input className="input text-2xl" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="💻" maxLength={4} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => setForm({ ...form, color: c })}
                        className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {modal !== 'create' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  <span className="text-sm text-gray-700">Catégorie active</span>
                </label>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="btn-secondary text-sm">Annuler</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}