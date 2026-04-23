import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import PlayerLayout from '../../components/PlayerLayout'

export default function CategoryPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [starting, setStarting]     = useState(null)
  const navigate                    = useNavigate()

  useEffect(() => {
    api.get('/categories').then(({ data }) => {
      setCategories(data)
      setLoading(false)
    })
  }, [])

  const startQuiz = async (categoryId) => {
    setStarting(categoryId)
    try {
      const { data } = await api.post('/quiz/start', { category_id: categoryId })
      navigate(`/quiz/${categoryId}`, { state: { quizData: data } })
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors du démarrage.')
    } finally {
      setStarting(null)
    }
  }

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-amber-100 text-amber-700',
    hard: 'bg-red-100 text-red-700',
  }

  return (
    <PlayerLayout>
      <div className="animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Choisir une catégorie</h1>
          <p className="text-gray-500 mt-1">Sélectionnez un sujet et testez vos connaissances avec 10 questions !</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => startQuiz(cat.id)}
                disabled={starting === cat.id || cat.active_questions_count === 0}
                className="card text-left hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: cat.color + '22' }}
                  >
                    {cat.icon || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{cat.name}</h3>
                    <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400">
                        📝 {cat.active_questions_count} questions
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">10 questions · ~5 min</span>
                  {starting === cat.id ? (
                    <span className="text-sm text-indigo-600 font-medium animate-pulse">Démarrage...</span>
                  ) : (
                    <span
                      className="text-sm font-semibold px-3 py-1 rounded-lg text-white transition-colors"
                      style={{ backgroundColor: cat.color }}
                    >
                      Jouer ▶
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PlayerLayout>
  )
}