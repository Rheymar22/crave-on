<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /*
    |------------------------------------------------------------------
    | POST /api/auth/register
    |------------------------------------------------------------------
    */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'phone'    => ['nullable', 'string', 'max:20'],
        ]);

        $user = User::create([
            'name'     => $validated['name'],
            'email'    => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone'    => $validated['phone'] ?? null,
            'role'     => 'customer', // always customer on self-register
        ]);

        $token = $user->createToken('craveon_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Welcome to Crave On! Registration successful.',
            'data'    => [
                'user'  => new UserResource($user),
                'token' => $token,
            ],
        ], 201);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/auth/login
    |------------------------------------------------------------------
    */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt($validated)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password.',
            ], 401);
        }

        $user  = Auth::user();

        // Revoke old tokens to keep things clean (optional)
        $user->tokens()->delete();

        $token = $user->createToken('craveon_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful. Welcome back!',
            'data'    => [
                'user'  => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/auth/logout
    |------------------------------------------------------------------
    */
    public function logout(Request $request): JsonResponse
    {
        // Only revoke the current device token
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /*
    |------------------------------------------------------------------
    | GET /api/auth/me
    |------------------------------------------------------------------
    */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => new UserResource($request->user()),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | PUT /api/auth/profile
    |------------------------------------------------------------------
    */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name'    => ['sometimes', 'required', 'string', 'max:255'],
            'phone'   => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['sometimes', 'nullable', 'string', 'max:500'],
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => new UserResource($user->fresh()),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | PUT /api/auth/password
    |------------------------------------------------------------------
    */
    public function updatePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::min(8)],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect.',
                'errors'  => [
                    'current_password' => ['The current password you entered is wrong.'],
                ],
            ], 422);
        }

        $request->user()->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }
}
