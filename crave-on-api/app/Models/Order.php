<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'status',
        'subtotal',
        'tax',
        'total_amount',
        'order_type',
        'delivery_address',
        'notes',
        'payment_status',
        'payment_method',
        'paid_at',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'     => 'decimal:2',
            'tax'          => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_at'      => 'datetime',
        ];
    }

    // ── Auto-generate Order Number on Create ──────────────

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            $order->order_number = static::generateOrderNumber();
        });
    }

    private static function generateOrderNumber(): string
    {
        $date   = now()->format('Ymd');
        $count  = static::whereDate('created_at', today())->count() + 1;
        return sprintf('ORD-%s-%04d', $date, $count);
        // e.g. ORD-20240520-0001
    }

    // ── Helpers ───────────────────────────────────────────

    // Only pending or confirmed orders can be cancelled
    public function isCancellable(): bool
    {
        return in_array($this->status, ['pending', 'confirmed']);
    }

    // ── Relationships ─────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
