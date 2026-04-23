<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // PUBLIC: liste des catégories actives
    public function index()
    {
        $categories = Category::withCount(['activeQuestions'])
            ->where('is_active', true)
            ->get();

        return response()->json($categories);
    }

    // ADMIN: toutes les catégories
    public function adminIndex()
    {
        $categories = Category::withCount(['questions', 'activeQuestions'])->get();
        return response()->json($categories);
    }

    // ADMIN: créer une catégorie
    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string|max:100|unique:categories',
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:10',
            'color'       => 'nullable|string|max:7',
        ]);

        $category = Category::create([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'icon'        => $request->icon,
            'color'       => $request->color ?? '#6366f1',
            'is_active'   => true,
        ]);

        return response()->json($category, 201);
    }

    // ADMIN: modifier une catégorie
    public function update(Request $request, Category $category)
    {
        $request->validate([
            'name'        => 'required|string|max:100|unique:categories,name,' . $category->id,
            'description' => 'nullable|string',
            'icon'        => 'nullable|string|max:10',
            'color'       => 'nullable|string|max:7',
            'is_active'   => 'boolean',
        ]);

        $category->update([
            'name'        => $request->name,
            'slug'        => Str::slug($request->name),
            'description' => $request->description,
            'icon'        => $request->icon,
            'color'       => $request->color,
            'is_active'   => $request->is_active ?? $category->is_active,
        ]);

        return response()->json($category);
    }

    // ADMIN: supprimer une catégorie
    public function destroy(Category $category)
    {
        $category->delete();
        return response()->json(['message' => 'Catégorie supprimée.']);
    }
}