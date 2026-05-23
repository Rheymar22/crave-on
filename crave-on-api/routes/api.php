<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

/*
|==========================================================================
| PUBLIC ROUTES — No authentication required
|==========================================================================
*/

// Auth
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
});

// Public menu browsing
Route::get('categories',          [CategoryController::class, 'index']);
Route::get('products',            [ProductController::class,  'index']);
Route::get('products/{product}',  [ProductController::class,  'show']);

/*
|==========================================================================
| AUTHENTICATED ROUTES — Any logged-in user (customer or admin)
|==========================================================================
*/
Route::middleware('auth:sanctum')->group(function () {

    // Auth profile management
    Route::prefix('auth')->group(function () {
        Route::post('logout',   [AuthController::class, 'logout']);
        Route::get('me',        [AuthController::class, 'me']);
        Route::put('profile',   [AuthController::class, 'updateProfile']);
        Route::put('password',  [AuthController::class, 'updatePassword']);
    });

    // Customer order management
    Route::prefix('orders')->group(function () {
        Route::get('/',                   [OrderController::class, 'index']);
        Route::post('/',                  [OrderController::class, 'store']);
        Route::get('/{order}',            [OrderController::class, 'show']);
        Route::post('/{order}/cancel',    [OrderController::class, 'cancel']);
    });

    /*
    |======================================================================
    | ADMIN ROUTES — Must be authenticated AND have role = admin
    |======================================================================
    */
    Route::middleware('admin')->prefix('admin')->group(function () {

        // Analytics dashboard
        Route::get('analytics', [AnalyticsController::class, 'index']);

        // Category management
        Route::prefix('categories')->group(function () {
            Route::post('/',              [CategoryController::class, 'store']);
            Route::put('/{category}',     [CategoryController::class, 'update']);
            Route::delete('/{category}',  [CategoryController::class, 'destroy']);
        });

        // Product management
        Route::prefix('products')->group(function () {
            Route::get('/',                        [ProductController::class, 'adminIndex']);
            Route::post('/',                       [ProductController::class, 'store']);
            Route::post('/upload-image',       [ProductController::class, 'uploadImage']);
            Route::put('/{product}',               [ProductController::class, 'update']);
            Route::delete('/{product}',            [ProductController::class, 'destroy']);
            Route::patch('/{product}/toggle',      [ProductController::class, 'toggleAvailability']);
        });

        // Order management
        Route::prefix('orders')->group(function () {
            Route::get('/',                        [OrderController::class, 'adminIndex']);
            Route::get('/{order}',                 [OrderController::class, 'show']);
            Route::patch('/{order}/status',        [OrderController::class, 'updateStatus']);
        });
    });
});
