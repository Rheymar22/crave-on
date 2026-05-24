<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Webhook extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'url',
        'events',
        'secret',
        'is_active',
        'success_count',
        'failure_count',
        'last_triggered_at',
    ];

    protected function casts(): array
    {
        return [
            'events'            => 'array',
            'is_active'         => 'boolean',
            'last_triggered_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(WebhookLog::class);
    }

    // Generate HMAC signature for payload verification
    public function generateSignature(string $payload): string
    {
        return 'sha256=' . hash_hmac('sha256', $payload, $this->secret);
    }

    // Check if this webhook listens for a given event
    public function listensTo(string $event): bool
    {
        return in_array($event, $this->events ?? []);
    }
}
