<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\GameSession;
use App\Models\GameAnswer;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    // Démarrer une session de jeu
    public function start(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
        ]);

        $category = Category::findOrFail($request->category_id);

        // Récupérer 10 questions aléatoires actives
        $questions = Question::where('category_id', $category->id)
            ->where('is_active', true)
            ->with('answers')
            ->inRandomOrder()
            ->limit(10)
            ->get();

        if ($questions->count() < 1) {
            return response()->json([
                'message' => 'Pas assez de questions dans cette catégorie.'
            ], 422);
        }

        // Créer la session
        $session = GameSession::create([
            'user_id'         => $request->user()->id,
            'category_id'     => $category->id,
            'total_questions' => $questions->count(),
            'status'          => 'in_progress',
        ]);

        // Préparer les questions (sans indiquer la bonne réponse)
        $questionsData = $questions->map(function ($q) {
            return [
                'id'           => $q->id,
                'question_text'=> $q->question_text,
                'difficulty'   => $q->difficulty,
                'points'       => $q->points,
                'time_limit'   => $q->time_limit,
                'answers'      => $q->answers->map(fn($a) => [
                    'id'          => $a->id,
                    'answer_text' => $a->answer_text,
                ])->shuffle()->values(),
            ];
        });

        return response()->json([
            'session_id' => $session->id,
            'category'   => $category->only(['id', 'name', 'icon', 'color']),
            'questions'  => $questionsData,
        ]);
    }

    // Soumettre une réponse
    public function submitAnswer(Request $request)
    {
        $request->validate([
            'session_id'  => 'required|exists:game_sessions,id',
            'question_id' => 'required|exists:questions,id',
            'answer_id'   => 'nullable|exists:answers,id',
            'time_spent'  => 'integer|min:0',
        ]);

        $session = GameSession::findOrFail($request->session_id);

        // Vérifier que la session appartient à l'utilisateur
        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        if ($session->status !== 'in_progress') {
            return response()->json(['message' => 'Session terminée.'], 422);
        }

        $question = Question::with(['answers', 'correctAnswer'])->findOrFail($request->question_id);
        $correctAnswer = $question->correctAnswer;

        $isCorrect = $request->answer_id && $request->answer_id == $correctAnswer->id;
        $pointsEarned = $isCorrect ? $question->points : 0;

        // Bonus de rapidité (max 50% bonus si répondu en moins de la moitié du temps)
        if ($isCorrect && $request->time_spent && $question->time_limit > 0) {
            $timeRatio = $request->time_spent / $question->time_limit;
            if ($timeRatio < 0.5) {
                $pointsEarned = (int) ($pointsEarned * 1.5);
            }
        }

        GameAnswer::create([
            'game_session_id' => $session->id,
            'question_id'     => $question->id,
            'answer_id'       => $request->answer_id,
            'is_correct'      => $isCorrect,
            'time_spent'      => $request->time_spent ?? 0,
            'points_earned'   => $pointsEarned,
        ]);

        return response()->json([
            'is_correct'     => $isCorrect,
            'correct_answer' => [
                'id'          => $correctAnswer->id,
                'answer_text' => $correctAnswer->answer_text,
            ],
            'points_earned'  => $pointsEarned,
            'explanation'    => $question->explanation,
        ]);
    }

    // Terminer la session et calculer le score final
    public function finish(Request $request)
    {
        $request->validate([
            'session_id' => 'required|exists:game_sessions,id',
            'time_taken' => 'nullable|integer',
        ]);

        $session = GameSession::with('gameAnswers')->findOrFail($request->session_id);

        if ($session->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $totalScore    = $session->gameAnswers->sum('points_earned');
        $correctCount  = $session->gameAnswers->where('is_correct', true)->count();

        $session->update([
            'score'           => $totalScore,
            'correct_answers' => $correctCount,
            'status'          => 'completed',
            'time_taken'      => $request->time_taken,
        ]);

        // Mettre à jour le profil utilisateur
        $user = $request->user();
        $user->increment('total_score', $totalScore);
        $user->increment('games_played');

        return response()->json([
            'score'           => $totalScore,
            'correct_answers' => $correctCount,
            'total_questions' => $session->total_questions,
            'percentage'      => $session->percentage,
            'time_taken'      => $request->time_taken,
        ]);
    }

    // Classement général
    public function leaderboard()
    {
        $leaderboard = \App\Models\User::select(['id', 'name', 'total_score', 'games_played'])
            ->where('role', 'user')
            ->orderByDesc('total_score')
            ->limit(20)
            ->get()
            ->map(function ($user, $index) {
                return [
                    'rank'         => $index + 1,
                    'name'         => $user->name,
                    'total_score'  => $user->total_score,
                    'games_played' => $user->games_played,
                ];
            });

        return response()->json($leaderboard);
    }

    // Historique des parties du joueur connecté
    public function history(Request $request)
    {
        $sessions = GameSession::with('category')
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->latest()
            ->paginate(10);

        return response()->json($sessions);
    }
}