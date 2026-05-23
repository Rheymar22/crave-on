<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'product_id'    => $this->product_id,

            // Snapshot values — frozen at time of purchase
            'product_name'  => $this->product_name,
            'price_at_time' => (float) $this->price_at_time,

            'quantity'      => $this->quantity,
            'subtotal'      => (float) $this->subtotal,

            // Only included when load('product') is called
            'product'       => new ProductResource($this->whenLoaded('product')),
        ];
    }
}
