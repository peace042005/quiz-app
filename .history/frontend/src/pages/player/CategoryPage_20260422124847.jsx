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
              <div
                key={cat.id}
                className="card group hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => startQuiz(cat.id)}
              >
                <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">{cat.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${difficultyColors[cat.difficulty] || ''}`}>
                    {cat.difficulty}
                  </span>
                  <button
                    className={`text-sm font-bold px-4 py-1.5 rounded-lg transition-all ${
                      starting === cat.id
                        ? 'bg-indigo-600 text-white opacity-50 cursor-wait'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    {starting === cat.id ? '⏳' : 'Jouer →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PlayerLayout>
  )
}
