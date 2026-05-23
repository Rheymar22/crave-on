<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    /*
    |------------------------------------------------------------------
    | GET /api/products  (Public)
    | Browse the menu — only available products
    | Supports: ?category=iced-drinks  ?search=latte  ?per_page=12
    |------------------------------------------------------------------
    */
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->available()
            ->orderBy('name');

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $products = $query->paginate($request->input('per_page', 12));

        return response()->json([
            'success' => true,
            'data'    => ProductResource::collection($products),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /*
    |------------------------------------------------------------------
    | GET /api/products/{product}  (Public)
    | Single product detail page
    |------------------------------------------------------------------
    */
    public function show(Product $product): JsonResponse
    {
        if (! $product->is_available) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found.',
            ], 404);
        }

        $product->load('category');

        return response()->json([
            'success' => true,
            'data'    => new ProductResource($product),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | GET /api/admin/products  (Admin)
    | All products including unavailable ones
    |------------------------------------------------------------------
    */
    public function adminIndex(Request $request): JsonResponse
    {
        $query = Product::with('category')
            ->orderBy('created_at', 'desc');

        if ($request->filled('category')) {
            $query->byCategory($request->category);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('is_available')) {
            $query->where(
                'is_available',
                filter_var($request->is_available, FILTER_VALIDATE_BOOLEAN)
            );
        }

        $products = $query->paginate($request->input('per_page', 15));

        return response()->json([
            'success' => true,
            'data'    => ProductResource::collection($products),
            'meta'    => [
                'current_page' => $products->currentPage(),
                'last_page'    => $products->lastPage(),
                'per_page'     => $products->perPage(),
                'total'        => $products->total(),
            ],
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/admin/products  (Admin)
    |------------------------------------------------------------------
    */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category_id'  => ['required', 'exists:categories,id'],
            'name'         => ['required', 'string', 'max:255', 'unique:products,name'],
            'description'  => ['nullable', 'string'],
            'price'        => ['required', 'numeric', 'min:0'],
            'image_url'    => ['nullable', 'max:2048'],
            'is_available' => ['sometimes', 'boolean'],
            'stock'        => ['sometimes', 'integer', 'min:0'],
        ]);

        $validated['slug'] = Str::slug($validated['name']);

        $product = Product::create($validated);
        $product->load('category');

        return response()->json([
            'success' => true,
            'message' => "'{$product->name}' has been added to the menu.",
            'data'    => new ProductResource($product),
        ], 201);
    }

    /*
    |------------------------------------------------------------------
    | PUT /api/admin/products/{product}  (Admin)
    |------------------------------------------------------------------
    */
    public function update(Request $request, Product $product): JsonResponse
    {
        $validated = $request->validate([
            'category_id'  => ['sometimes', 'exists:categories,id'],
            'name'         => [
                'sometimes', 'required', 'string', 'max:255',
                'unique:products,name,' . $product->id,
            ],
            'description'  => ['nullable', 'string'],
            'price'        => ['sometimes', 'numeric', 'min:0'],
            'image_url'    => ['nullable', 'max:2048'],
            'is_available' => ['sometimes', 'boolean'],
            'stock'        => ['sometimes', 'integer', 'min:0'],
        ]);

        if (isset($validated['name'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }

        $product->update($validated);

        return response()->json([
            'success' => true,
            'message' => "'{$product->name}' has been updated.",
            'data'    => new ProductResource($product->fresh()->load('category')),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | DELETE /api/admin/products/{product}  (Admin)
    | Soft delete — product hidden but order history intact
    |------------------------------------------------------------------
    */
    public function destroy(Product $product): JsonResponse
    {
        $name = $product->name;
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => "'{$name}' has been removed from the menu.",
        ]);
    }

    /*
    |------------------------------------------------------------------
    | PATCH /api/admin/products/{product}/toggle  (Admin)
    | Quickly toggle availability on/off
    |------------------------------------------------------------------
    */
    public function toggleAvailability(Product $product): JsonResponse
    {
        $product->update(['is_available' => ! $product->is_available]);

        $status = $product->is_available ? 'available' : 'unavailable';

        return response()->json([
            'success' => true,
            'message' => "'{$product->name}' is now {$status}.",
            'data'    => [
                'id'           => $product->id,
                'is_available' => $product->is_available,
            ],
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/admin/products/upload-image  (Admin)
    | Handles image file upload, returns the public URL
    |------------------------------------------------------------------
    */
    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => [
                'required',
                'image',
                'mimes:jpeg,jpg,png,webp',
                'max:2048', // 2MB max
            ],
        ]);

        // Store in storage/app/public/products/
        $path = $request->file('image')->store('products', 'public');

        return response()->json([
            'success'   => true,
            'message'   => 'Image uploaded successfully.',
            'image_url' => asset('storage/' . $path),
            'path'      => $path,
        ]);
    }
}
