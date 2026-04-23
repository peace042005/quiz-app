<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GameAnswer extends Model
{
    protected $fillable = [
        'game_session_id',
        'question_id',
        'answer_id',
        'is_correct',
        'time_spent',
        'points_earned',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
    ];

    public function gameSession()
    {
        return $this->belongsTo(GameSession::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function answer()
    {
        return $this->belongsTo(Answer::class);
    }
}