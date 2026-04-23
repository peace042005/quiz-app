@import "tailwindcss";

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}

@layer components {
  .btn-primary {
    @apply bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  .btn-secondary {
    @apply bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-5 rounded-xl border border-gray-200 transition-all duration-200 active:scale-95;
  }
  .btn-danger {
    @apply bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all duration-200 active:scale-95;
  }
  .card {
    @apply bg-white rounded-2xl shadow-sm border border-gray-100 p-6;
  }
  .input {
    @apply w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all;
  }
  .badge-easy   { @apply bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full; }
  .badge-medium { @apply bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5 rounded-full; }
  .badge-hard   { @apply bg-red-100 text-red-700 text-xs font-semibold px-2 py-0.5 rounded-full; }
}import { useState, useEffect, useCallback } from 'react'
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
      const { data } = await api.post('/quiz/answer', {
        quiz_id: quizData.id,
        question_id: question.id,
        answer_id: answerId,
        time_spent: timeSpent,
      })
      setFeedback(data.feedback)
      setTotalScore(data.total_score ?? 0)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setSubmitting(false)
    }
  }, [submitting, feedback])

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelected(null)
      setFeedback(null)
    } else {
      finishQuiz()
    }
  }

  const finishQuiz = async () => {
    try {
      const { data } = await api.post('/quiz/finish', {
        quiz_id: quizData.id,
        total_time: Math.round((Date.now() - gameStartTime) / 1000),
      })
      navigate('/result', { state: { result: data.result, category: quizData.category } })
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  if (!quizData || !question) return null

  const isAnswered = feedback !== null
  const isCorrect  = feedback?.isCorrect

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-600 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 text-white">
          <div>
            <h1 className="font-bold">{quizData.category.name}</h1>
            <p className="text-indigo-100 text-sm">Question {currentIndex + 1}/{questions.length}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-2xl">{totalScore}</p>
            <p className="text-indigo-100 text-sm">pts</p>
          </div>
        </div>

        {/* Progress */}
        <div className="w-full h-2 bg-indigo-500 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Timer & Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">{question.question}</h2>
            <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
              timeLeft <= 5 ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {timeLeft}s
            </div>
          </div>

          {/* Difficulty */}
          <div className="mb-6 flex gap-2">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
              question.difficulty === 'easy' ? 'badge-easy' :
              question.difficulty === 'medium' ? 'badge-medium' :
              'badge-hard'
            }`}>
              {question.difficulty}
            </span>
          </div>

          {/* Answers */}
          <div className="space-y-3">
            {question.choices.map((choice) => {
              const isSelected = selected === choice.id
              const isCorrectChoice = choice.id === feedback?.correctAnswer
              let bgColor = 'hover:bg-gray-50 cursor-pointer'

              if (isAnswered) {
                if (isCorrectChoice) {
                  bgColor = 'bg-green-100 border-green-500'
                } else if (isSelected && !isCorrect) {
                  bgColor = 'bg-red-100 border-red-500'
                }
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => !isAnswered && handleSubmit(choice.id)}
                  disabled={isAnswered}
                  className={`w-full p-4 rounded-xl border-2 border-gray-200 text-left transition-all ${bgColor} ${
                    isSelected && !isAnswered ? 'border-indigo-500 bg-indigo-50' : ''
                  }`}
                >
                  {choice.text}
                </button>
              )
            })}
          </div>

          {/* Feedback */}
          {isAnswered && (
            <div className={`mt-6 p-4 rounded-lg ${isCorrect ? 'bg-green-50 border border-green-300' : 'bg-red-50 border border-red-300'}`}>
              <p className={`font-bold mb-1 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✅ Correct !' : '❌ Incorrect'}
              </p>
              {feedback?.explanation && (
                <p className="text-sm text-gray-700">{feedback.explanation}</p>
              )}
              <p className={`text-sm font-bold mt-2 ${isCorrect ? 'text-green-600' : 'text-gray-600'}`}>
                +{feedback?.points} point{feedback?.points > 1 ? 's' : ''}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        {isAnswered && (
          <button
            onClick={handleNext}
            className="w-full btn-primary"
          >
            {currentIndex === questions.length - 1 ? 'Terminer' : 'Suivant'} →
          </button>
        )}
      </div>
    </div>
  )
}
