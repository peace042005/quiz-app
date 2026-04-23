import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api'

export default function QuizPage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const quizData  = location.state?.quizData

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected,     setSelected]     = useState(null)
  const [feedback,     setFeedback]     = useState(null) // {isCorrect, correctAnswer, explanation, points}
  const [timeLeft,     setTimeLeft]     = useState(null)
  const [totalScore,   setTotalScore]   = useState(0)
  const [startTime,    setStartTime]    = useState(Date.now())
  const [gameStartTime]                 = useState(Date.now())
  const [submitting,   setSubmitting]   = useState(false)

  const questions = quizData?.questions ?? []
  const question  = questions[currentIndex]

  // Rediriger si pas de données
  useEffect(() => {
    if (!quizData) navigate('/categories')
  }, [quizData])

  // Timer
  useEffect(() => {
    if (!question || feedback) return
    setTimeLeft(question.time_limit)
    setStartTime(Date.now())
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          handleSubmit(null) // Temps écoulé = pas de réponse
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [currentIndex, question?.id])

  const handleSubmit = useCallback(async (answerId) => {
    if (submitting || feedback) return
    setSubmitting(true)
    setSelected(answerId)

    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    try {
      const { data } = await api.post('/quiz/submit-answer', {
        session_id:  quizData.session_id,
        question_id: question.id,
        answer_id:   answerId,
        time_spent:  timeSpent,
      })
      setFeedback(data)
      setTotalScore(prev => prev + (data.points_earned ?? 0))
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, feedback, question, quizData, startTime])

  const handleNext = async () => {
    if (currentIndex + 1 >= questions.length) {
      // Terminer la partie
      const timeTaken = Math.round((Date.now() - gameStartTime) / 1000)
      try {
        const { data } = await api.post('/quiz/finish', {
          session_id: quizData.session_id,
          time_taken: timeTaken,
        })
        navigate('/result', { state: { result: data, category: quizData.category } })
      } catch (err) {
        navigate('/')
      }
    } else {
      setCurrentIndex(i => i + 1)
      setSelected(null)
      setFeedback(null)
    }
  }

  if (!quizData || !question) return null

  const timerPercent = timeLeft !== null ? (timeLeft / question.time_limit) * 100 : 100
  const timerColor   = timerPercent > 50 ? 'bg-green-500' : timerPercent > 25 ? 'bg-amber-500' : 'bg-red-500'

  const getAnswerClass = (answerId) => {
    const base = 'w-full text-left px-4 py-3.5 rounded-xl border-2 font-medium transition-all duration-200 '
    if (!feedback) {
      return base + (selected === answerId
        ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
        : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 text-gray-700')
    }
    if (answerId === feedback.correct_answer.id) return base + 'border-green-500 bg-green-50 text-green-700'
    if (answerId === selected && !feedback.is_correct) return base + 'border-red-400 bg-red-50 text-red-700'
    return base + 'border-gray-100 bg-gray-50 text-gray-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">{quizData.category.icon}</span>
            <span className="text-sm font-medium text-gray-600">{quizData.category.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} / {questions.length}
            </span>
            <span className="bg-indigo-100 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full">
              ⭐ {totalScore} pts
            </span>
          </div>
        </div>

        {/* Progress bar globale */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div
            className="h-2 bg-indigo-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>

        {/* Card question */}
        <div className="card">
          {/* Timer */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              question.difficulty === 'easy' ? 'badge-easy' :
              question.difficulty === 'medium' ? 'badge-medium' : 'badge-hard'
            }`}>
              {question.difficulty === 'easy' ? 'Facile' : question.difficulty === 'medium' ? 'Moyen' : 'Difficile'}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${timerColor}`}
                  style={{ width: `${timerPercent}%` }}
                />
              </div>
              <span className={`text-sm font-bold tabular-nums ${timerPercent < 25 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Question */}
          <h2 className="text-xl font-bold text-gray-800 mb-6 leading-snug">
            {question.question_text}
          </h2>

          {/* Réponses */}
          <div className="space-y-3 mb-6">
            {question.answers.map((ans) => (
              <button
                key={ans.id}
                onClick={() => !feedback && handleSubmit(ans.id)}
                disabled={!!feedback || submitting}
                className={getAnswerClass(ans.id)}
              >
                <div className="flex items-center gap-3">
                  {feedback && ans.id === feedback.correct_answer.id && (
                    <span className="text-green-600 text-lg">✓</span>
                  )}
                  {feedback && ans.id === selected && !feedback.is_correct && (
                    <span className="text-red-500 text-lg">✗</span>
                  )}
                  <span>{ans.answer_text}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className={`animate-bounce-in p-4 rounded-xl mb-4 ${
              feedback.is_correct ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{feedback.is_correct ? '🎉' : '😔'}</span>
                <span className={`font-bold ${feedback.is_correct ? 'text-green-700' : 'text-red-700'}`}>
                  {feedback.is_correct
                    ? `Bravo ! +${feedback.points_earned} points`
                    : `Incorrect. La bonne réponse était : "${feedback.correct_answer.answer_text}"`}
                </span>
              </div>
              {feedback.explanation && (
                <p className="text-sm text-gray-600 mt-1">{feedback.explanation}</p>
              )}
            </div>
          )}

          {/* Bouton Suivant */}
          {feedback && (
            <button onClick={handleNext} className="btn-primary w-full animate-fade-in">
              {currentIndex + 1 >= questions.length ? 'Voir mes résultats 🏁' : 'Question suivante →'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}