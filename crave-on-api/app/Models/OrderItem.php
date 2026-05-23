<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'price_at_time',
        'quantity',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'price_at_time' => 'decimal:2',
            'subtotal'      => 'decimal:2',
            'quantity'      => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        // withTrashed() so soft-deleted products still load
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
