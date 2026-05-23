<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    /*
    |------------------------------------------------------------------
    | GET /api/categories  (Public)
    | List all categories with product count for the menu nav
    |------------------------------------------------------------------
    */
    public function index(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => CategoryResource::collection($categories),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/admin/categories  (Admin)
    |------------------------------------------------------------------
    */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:categories,name'],
            'icon' => ['nullable', 'string', 'max:10'],
        ]);

        $category = Category::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']),
            'icon' => $validated['icon'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Category created successfully.',
            'data'    => new CategoryResource($category),
        ], 201);
    }

    /*
    |------------------------------------------------------------------
    | PUT /api/admin/categories/{category}  (Admin)
    |------------------------------------------------------------------
    */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => [
                'sometimes', 'required', 'string', 'max:100',
                'unique:categories,name,' . $category->id,
            ],
            'icon' => ['nullable', 'string', 'max:10'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $category->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Category updated successfully.',
            'data'    => new CategoryResource($category->fresh()),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | DELETE /api/admin/categories/{category}  (Admin)
    |------------------------------------------------------------------
    */
    public function destroy(Category $category): JsonResponse
    {
        // Prevent deleting a category that still has products
        if ($category->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete this category because it still has products. ' .
                             'Please reassign or delete the products first.',
            ], 409);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }
}
