<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Answer;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    // ADMIN: liste toutes les questions (paginées)
    public function index(Request $request)
    {
        $query = Question::with(['category', 'answers'])
            ->when($request->category_id, fn($q) => $q->where('category_id', $request->category_id))
            ->when($request->difficulty, fn($q) => $q->where('difficulty', $request->difficulty))
            ->when($request->search, fn($q) => $q->where('question_text', 'like', '%' . $request->search . '%'));

        $questions = $query->latest()->paginate(15);

        return response()->json($questions);
    }

    // ADMIN: voir une question
    public function show(Question $question)
    {
        return response()->json($question->load(['category', 'answers']));
    }

    // ADMIN: créer une question avec ses réponses
    public function store(Request $request)
    {
        $request->validate([
            'category_id'   => 'required|exists:categories,id',
            'question_text' => 'required|string',
            'difficulty'    => 'required|in:easy,medium,hard',
            'points'        => 'integer|min:1|max:100',
            'time_limit'    => 'integer|min:10|max:120',
            'explanation'   => 'nullable|string',
            'answers'       => 'required|array|min:2|max:6',
            'answers.*.answer_text' => 'required|string',
            'answers.*.is_correct'  => 'required|boolean',
        ]);

        // Vérifier qu'il y a exactement une bonne réponse
        $correctCount = collect($request->answers)->where('is_correct', true)->count();
        if ($correctCount !== 1) {
            return response()->json([
                'message' => 'Il doit y avoir exactement une bonne réponse.'
            ], 422);
        }

        $question = Question::create([
            'category_id'   => $request->category_id,
            'question_text' => $request->question_text,
            'difficulty'    => $request->difficulty,
            'points'        => $request->points ?? 10,
            'time_limit'    => $request->time_limit ?? 30,
            'explanation'   => $request->explanation,
            'is_active'     => true,
        ]);

        foreach ($request->answers as $index => $answerData) {
            Answer::create([
                'question_id' => $question->id,
                'answer_text' => $answerData['answer_text'],
                'is_correct'  => $answerData['is_correct'],
                'order'       => $index,
            ]);
        }

        return response()->json($question->load('answers'), 201);
    }

    // ADMIN: modifier une question
    public function update(Request $request, Question $question)
    {
        $request->validate([
            'category_id'   => 'exists:categories,id',
            'question_text' => 'string',
            'difficulty'    => 'in:easy,medium,hard',
            'points'        => 'integer|min:1|max:100',
            'time_limit'    => 'integer|min:10|max:120',
            'explanation'   => 'nullable|string',
            'is_active'     => 'boolean',
            'answers'       => 'array|min:2|max:6',
            'answers.*.answer_text' => 'required_with:answers|string',
            'answers.*.is_correct'  => 'required_with:answers|boolean',
        ]);

        if ($request->has('answers')) {
            $correctCount = collect($request->answers)->where('is_correct', true)->count();
            if ($correctCount !== 1) {
                return response()->json([
                    'message' => 'Il doit y avoir exactement une bonne réponse.'
                ], 422);
            }

            // Remplacer toutes les réponses
            $question->answers()->delete();
            foreach ($request->answers as $index => $answerData) {
                Answer::create([
                    'question_id' => $question->id,
                    'answer_text' => $answerData['answer_text'],
                    'is_correct'  => $answerData['is_correct'],
                    'order'       => $index,
                ]);
            }
        }

        $question->update($request->except('answers'));

        return response()->json($question->load('answers'));
    }

    // ADMIN: supprimer une question
    public function destroy(Question $question)
    {
        $question->delete();
        return response()->json(['message' => 'Question supprimée.']);
    }
}