<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        // Must be authenticated AND have admin role
        if (! $request->user() || ! $request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden. Admin access only.',
            ], 403);
        }

        return $next($request);
    }
}
