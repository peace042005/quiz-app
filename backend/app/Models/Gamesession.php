<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'category_id',
        'score',
        'total_questions',
        'correct_answers',
        'status',
        'time_taken',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function gameAnswers()
    {
        return $this->hasMany(GameAnswer::class);
    }

    public function getPercentageAttribute(): int
    {
        if ($this->total_questions === 0) return 0;
        return (int) round(($this->correct_answers / $this->total_questions) * 100);
    }
}