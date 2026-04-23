<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Category;
use App\Models\Question;
use App\Models\GameSession;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboard()
    {
        return response()->json([
            'stats' => [
                'total_users'     => User::where('role', 'user')->count(),
                'total_questions' => Question::count(),
                'total_categories'=> Category::count(),
                'total_games'     => GameSession::where('status', 'completed')->count(),
            ],
            'recent_games' => GameSession::with(['user', 'category'])
                ->where('status', 'completed')
                ->latest()
                ->limit(10)
                ->get(),
            'top_players' => User::select(['id', 'name', 'total_score', 'games_played'])
                ->where('role', 'user')
                ->orderByDesc('total_score')
                ->limit(5)
                ->get(),
        ]);
    }

    public function users()
    {
        $users = User::where('role', 'user')
            ->orderByDesc('total_score')
            ->paginate(20);

        return response()->json($users);
    }
}