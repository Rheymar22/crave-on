<?php

namespace App\Services;

use App\Models\Webhook;
use App\Models\WebhookLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    /*
    |------------------------------------------------------------------
    | Dispatch an event to all registered webhooks that listen for it
    |------------------------------------------------------------------
    */
    public function dispatch(string $event, array $data): void
    {
        $webhooks = Webhook::where('is_active', true)->get();

        foreach ($webhooks as $webhook) {
            if ($webhook->listensTo($event)) {
                $this->deliver($webhook, $event, $data);
            }
        }
    }

    /*
    |------------------------------------------------------------------
    | Deliver a single webhook event
    |------------------------------------------------------------------
    */
    public function deliver(
        Webhook $webhook,
        string  $event,
        array   $data
    ): WebhookLog {

        $payload = [
            'event'      => $event,
            'timestamp'  => now()->toIso8601String(),
            'data'       => $data,
        ];

        $payloadJson = json_encode($payload);
        $signature   = $webhook->generateSignature($payloadJson);
        $startTime   = microtime(true);

        // Create a pending log entry first
        $log = WebhookLog::create([
            'webhook_id' => $webhook->id,
            'event'      => $event,
            'payload'    => $payload,
            'status'     => 'pending',
        ]);

        try {
            $response = Http::timeout(10)
                ->withHeaders([
                    'Content-Type'       => 'application/json',
                    'X-CraveOn-Event'    => $event,
                    'X-CraveOn-Signature'=> $signature,
                    'X-CraveOn-Delivery' => $log->id,
                    'User-Agent'         => 'CraveOn-Webhook/1.0',
                ])
                ->post($webhook->url, $payload);

            $durationMs = (int) ((microtime(true) - $startTime) * 1000);
            $success    = $response->successful();

            // Update the log
            $log->update([
                'response_status' => $response->status(),
                'response_body'   => substr($response->body(), 0, 1000),
                'duration_ms'     => $durationMs,
                'status'          => $success ? 'success' : 'failed',
                'error_message'   => $success
                    ? null
                    : "HTTP {$response->status()}: {$response->body()}",
            ]);

            // Update webhook stats
            $webhook->increment($success ? 'success_count' : 'failure_count');
            $webhook->update(['last_triggered_at' => now()]);

        } catch (\Exception $e) {
            $durationMs = (int) ((microtime(true) - $startTime) * 1000);

            $log->update([
                'duration_ms'   => $durationMs,
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            $webhook->increment('failure_count');

            Log::error("Webhook delivery failed", [
                'webhook_id' => $webhook->id,
                'event'      => $event,
                'error'      => $e->getMessage(),
            ]);
        }

        return $log->fresh();
    }

    /*
    |------------------------------------------------------------------
    | Send a test ping to verify the webhook URL works
    |------------------------------------------------------------------
    */
    public function ping(Webhook $webhook): array
    {
        $log = $this->deliver($webhook, 'webhook.test', [
            'message' => 'This is a test event from Crave On.',
            'webhook' => [
                'id'   => $webhook->id,
                'name' => $webhook->name,
            ],
        ]);

        return [
            'success'         => $log->status === 'success',
            'response_status' => $log->response_status,
            'duration_ms'     => $log->duration_ms,
            'error'           => $log->error_message,
        ];
    }
}
