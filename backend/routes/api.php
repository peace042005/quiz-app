<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\QuestionController;
use App\Http\Controllers\Api\QuizController;
use App\Http\Controllers\Api\AdminController;
use Illuminate\Support\Facades\Route;

// ─── Routes publiques ──────────────────────────────────────────────
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Catégories publiques
Route::get('/categories', [CategoryController::class, 'index']);

// ─── Routes authentifiées ──────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/me',       [AuthController::class, 'me']);

    // Quiz (joueur)
    Route::post('/quiz/start',         [QuizController::class, 'start']);
    Route::post('/quiz/submit-answer', [QuizController::class, 'submitAnswer']);
    Route::post('/quiz/finish',        [QuizController::class, 'finish']);
    Route::get('/quiz/history',        [QuizController::class, 'history']);
    Route::get('/leaderboard',         [QuizController::class, 'leaderboard']);

    // ─── Routes Admin ──────────────────────────────────────────────
    Route::middleware('admin')->prefix('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);
        Route::get('/users',     [AdminController::class, 'users']);

        // Catégories (CRUD admin)
        Route::get('/categories',          [CategoryController::class, 'adminIndex']);
        Route::post('/categories',         [CategoryController::class, 'store']);
        Route::put('/categories/{category}',    [CategoryController::class, 'update']);
        Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

        // Questions (CRUD)
        Route::get('/questions',                [QuestionController::class, 'index']);
        Route::get('/questions/{question}',     [QuestionController::class, 'show']);
        Route::post('/questions',               [QuestionController::class, 'store']);
        Route::put('/questions/{question}',     [QuestionController::class, 'update']);
        Route::delete('/questions/{question}',  [QuestionController::class, 'destroy']);
    });
});