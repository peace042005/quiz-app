import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api'

const EMPTY_ANSWER = { answer_text: '', is_correct: false }

const EMPTY_FORM = {
  category_id:   '',
  question_text: '',
  difficulty:    'medium',
  points:        10,
  time_limit:    30,
  explanation:   '',
  is_active:     true,
  answers:       [
    { answer_text: '', is_correct: true  },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
    { answer_text: '', is_correct: false },
  ],
}

export default function AdminQuestionForm() {
  const { id }              = useParams()
  const navigate            = useNavigate()
  const isEdit              = !!id
  const [form, setForm]     = useState(EMPTY_FORM)
  const [categories, setCat]= useState([])
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    api.get('/admin/categories').then(({ data }) => setCat(data))
    if (isEdit) {
      api.get(`/admin/questions/${id}`).then(({ data }) => {
        setForm({
          category_id:   data.category_id,
          question_text: data.question_text,
          difficulty:    data.difficulty,
          points:        data.points,
          time_limit:    data.time_limit,
          explanation:   data.explanation || '',
          is_active:     data.is_active,
          answers:       data.answers.map(a => ({ answer_text: a.answer_text, is_correct: a.is_correct })),
        })
        setLoading(false)
      })
    }
  }, [id])

  const setAnswer = (idx, field, val) => {
    const updated = form.answers.map((a, i) => {
      if (field === 'is_correct' && val === true) return { ...a, is_correct: i === idx }
      if (i === idx) return { ...a, [field]: val }
      return a
    })
    setForm({ ...form, answers: updated })
  }

  const addAnswer = () => {
    if (form.answers.length >= 6) return
    setForm({ ...form, answers: [...form.answers, { ...EMPTY_ANSWER }] })
  }

  const removeAnswer = (idx) => {
    if (form.answers.length <= 2) return
    setForm({ ...form, answers: form.answers.filter((_, i) => i !== idx) })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    setSaving(true)
    try {
      if (isEdit) {
        await api.put(`/admin/questions/${id}`, form)
      } else {
        await api.post('/admin/questions', form)
      }
      navigate('/admin/questions')
    } catch (err) {
      const e = err.response?.data
      if (e?.errors) setErrors(e.errors)
      else if (e?.message) setErrors({ general: e.message })
    } finally {
      setSaving(false)
    }
  }

  const difficultyOptions = [
    { value: 'easy',   label: 'Facile',    points: 10, time: 20, color: 'text-green-600' },
    { value: 'medium', label: 'Moyen',     points: 20, time: 30, color: 'text-amber-600' },
    { value: 'hard',   label: 'Difficile', points: 30, time: 45, color: 'text-red-600'   },
  ]

  if (loading) {
    return <div className="space-y-4 animate-pulse">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-200 rounded-xl" />)}</div>
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/questions" className="text-gray-400 hover:text-gray-600 text-sm">← Retour</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Modifier la question' : 'Nouvelle question'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{errors.general}</div>
        )}

        {/* Question text */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Contenu de la question</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
            <select className="input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
              <option value="">— Choisir une catégorie —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            {errors.category_id && <p className="text-red-500 text-xs mt-1">{errors.category_id[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question *</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Écrivez la question ici..."
              value={form.question_text}
              onChange={e => setForm({ ...form, question_text: e.target.value })}
              required
            />
            {errors.question_text && <p className="text-red-500 text-xs mt-1">{errors.question_text[0]}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Explication (affichée après la réponse)</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Explication optionnelle..."
              value={form.explanation}
              onChange={e => setForm({ ...form, explanation: e.target.value })}
            />
          </div>
        </div>

        {/* Paramètres */}
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-800">Paramètres</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulté</label>
            <div className="flex gap-3">
              {difficultyOptions.map(d => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setForm({ ...form, difficulty: d.value, points: d.points, time_limit: d.time })}
                  className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    form.difficulty === d.value
                      ? `border-current bg-current/5 ${d.color}`
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number" min={1} max={100}
                className="input"
                value={form.points}
                onChange={e => setForm({ ...form, points: +e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temps limite (secondes)</label>
              <input
                type="number" min={10} max={120}
                className="input"
                value={form.time_limit}
                onChange={e => setForm({ ...form, time_limit: +e.target.value })}
              />
            </div>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-indigo-600" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
              <span className="text-sm text-gray-700">Question active</span>
            </label>
          )}
        </div>

        {/* Réponses */}
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-800">Réponses</h2>
            <button
              type="button"
              onClick={addAnswer}
              disabled={form.answers.length >= 6}
              className="text-indigo-600 text-sm font-medium hover:text-indigo-800 disabled:opacity-40"
            >
              ➕ Ajouter
            </button>
          </div>

          <p className="text-xs text-gray-400">
            Cliquez sur le bouton radio pour marquer la bonne réponse. Il ne peut y en avoir qu'une seule.
          </p>

          {errors.answers && <p className="text-red-500 text-xs">{errors.answers[0]}</p>}

          <div className="space-y-3">
            {form.answers.map((ans, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-colors ${
                  ans.is_correct ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setAnswer(idx, 'is_correct', true)}
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    ans.is_correct ? 'border-green-500 bg-green-500' : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {ans.is_correct && <span className="text-white text-xs">✓</span>}
                </button>

                <input
                  className={`flex-1 bg-transparent border-0 outline-none text-sm font-medium placeholder-gray-400 ${ans.is_correct ? 'text-green-800' : 'text-gray-700'}`}
                  placeholder={`Réponse ${idx + 1}${idx === 0 ? ' (bonne réponse par défaut)' : ''}`}
                  value={ans.answer_text}
                  onChange={e => setAnswer(idx, 'answer_text', e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => removeAnswer(idx)}
                  disabled={form.answers.length <= 2}
                  className="text-gray-300 hover:text-red-400 transition-colors disabled:opacity-20 flex-shrink-0"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-6">
          <Link to="/admin/questions" className="btn-secondary">Annuler</Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Sauvegarde...' : isEdit ? 'Mettre à jour' : 'Créer la question'}
          </button>
        </div>
      </form>
    </div>
  )
}