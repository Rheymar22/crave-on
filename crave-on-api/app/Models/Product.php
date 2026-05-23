<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'image_url',
        'is_available',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'price'        => 'decimal:2',
            'is_available' => 'boolean',
            'stock'        => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    // ── Query Scopes ──────────────────────────────────────

    // Product::available()->get()
    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    // Product::byCategory('iced')->get()
    public function scopeByCategory($query, string $slug)
    {
        return $query->whereHas('category', fn($q) =>
            $q->where('slug', $slug)
        );
    }
}
