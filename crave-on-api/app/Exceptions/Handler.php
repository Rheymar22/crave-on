<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /*
    |------------------------------------------------------------------
    | Force JSON responses for all /api/* routes
    |------------------------------------------------------------------
    */
    public function render($request, Throwable $e)
    {
        if ($request->is('api/*') || $request->expectsJson()) {

            // 422 — Validation errors
            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed.',
                    'errors'  => $e->errors(),
                ], 422);
            }

            // 404 — Model not found e.g. Product::findOrFail()
            if ($e instanceof ModelNotFoundException) {
                $model = class_basename($e->getModel());
                return response()->json([
                    'success' => false,
                    'message' => "{$model} not found.",
                ], 404);
            }

            // 401 — Not authenticated
            if ($e instanceof AuthenticationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthenticated. Please log in.',
                ], 401);
            }

            // 403, 404, 405, etc.
            if ($e instanceof HttpException) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage() ?: 'HTTP error occurred.',
                ], $e->getStatusCode());
            }

            // 500 — Everything else
            return response()->json([
                'success' => false,
                'message' => app()->isProduction()
                    ? 'An unexpected error occurred.'
                    : $e->getMessage(),
                'trace' => app()->isProduction()
                    ? null
                    : collect($e->getTrace())->take(5),
            ], 500);
        }

        return parent::render($request, $e);
    }
}
