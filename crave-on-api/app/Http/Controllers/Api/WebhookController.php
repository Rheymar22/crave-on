<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Webhook;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

// All available webhook events
const AVAILABLE_EVENTS = [
    'order.created',
    'order.status_updated',
    'order.cancelled',
    'product.created',
    'product.updated',
    'product.deleted',
    'webhook.test',
];

class WebhookController extends Controller
{
    public function __construct(
        protected WebhookService $webhookService
    ) {}

    /*
    |------------------------------------------------------------------
    | GET /api/admin/webhooks
    |------------------------------------------------------------------
    */
    public function index(): JsonResponse
    {
        $webhooks = Webhook::with('logs')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($w) => [
                'id'                => $w->id,
                'name'              => $w->name,
                'url'               => $w->url,
                'events'            => $w->events,
                'is_active'         => $w->is_active,
                'success_count'     => $w->success_count,
                'failure_count'     => $w->failure_count,
                'last_triggered_at' => $w->last_triggered_at?->toDateTimeString(),
                'recent_logs'       => $w->logs()
                    ->latest()
                    ->limit(5)
                    ->get()
                    ->map(fn ($log) => [
                        'id'              => $log->id,
                        'event'           => $log->event,
                        'status'          => $log->status,
                        'response_status' => $log->response_status,
                        'duration_ms'     => $log->duration_ms,
                        'created_at'      => $log->created_at->toDateTimeString(),
                    ]),
                'created_at'        => $w->created_at->toDateTimeString(),
            ]);

        return response()->json([
            'success'          => true,
            'data'             => $webhooks,
            'available_events' => AVAILABLE_EVENTS,
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/admin/webhooks
    |------------------------------------------------------------------
    */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'   => ['required', 'string', 'max:100'],
            'url'    => ['required', 'url', 'max:500'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string', 'in:' . implode(',', AVAILABLE_EVENTS)],
        ]);

        $webhook = Webhook::create([
            'user_id'   => $request->user()->id,
            'name'      => $validated['name'],
            'url'       => $validated['url'],
            'events'    => $validated['events'],
            'secret'    => Str::random(32), // auto-generate secret
            'is_active' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Webhook '{$webhook->name}' created.",
            'data'    => [
                'id'      => $webhook->id,
                'name'    => $webhook->name,
                'url'     => $webhook->url,
                'events'  => $webhook->events,
                'secret'  => $webhook->secret, // only shown once on creation
                'is_active' => $webhook->is_active,
            ],
        ], 201);
    }

    /*
    |------------------------------------------------------------------
    | PUT /api/admin/webhooks/{webhook}
    |------------------------------------------------------------------
    */
    public function update(Request $request, Webhook $webhook): JsonResponse
    {
        $validated = $request->validate([
            'name'      => ['sometimes', 'string', 'max:100'],
            'url'       => ['sometimes', 'url', 'max:500'],
            'events'    => ['sometimes', 'array', 'min:1'],
            'events.*'  => ['string', 'in:' . implode(',', AVAILABLE_EVENTS)],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $webhook->update($validated);

        return response()->json([
            'success' => true,
            'message' => "Webhook '{$webhook->name}' updated.",
            'data'    => $webhook->fresh(),
        ]);
    }

    /*
    |------------------------------------------------------------------
    | DELETE /api/admin/webhooks/{webhook}
    |------------------------------------------------------------------
    */
    public function destroy(Webhook $webhook): JsonResponse
    {
        $name = $webhook->name;
        $webhook->delete();

        return response()->json([
            'success' => true,
            'message' => "Webhook '{$name}' deleted.",
        ]);
    }

    /*
    |------------------------------------------------------------------
    | POST /api/admin/webhooks/{webhook}/test
    | Send a test ping to verify the URL works
    |------------------------------------------------------------------
    */
    public function test(Webhook $webhook): JsonResponse
    {
        $result = $this->webhookService->ping($webhook);

        return response()->json([
            'success' => $result['success'],
            'message' => $result['success']
                ? '✅ Webhook delivered successfully!'
                : '❌ Webhook delivery failed.',
            'data'    => $result,
        ]);
    }
}
