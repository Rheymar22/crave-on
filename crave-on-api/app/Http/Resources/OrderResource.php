<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'order_number'     => $this->order_number,
            'status'           => $this->status,
            'subtotal'         => (float) $this->subtotal,
            'tax'              => (float) $this->tax,
            'total_amount'     => (float) $this->total_amount,
            'order_type'       => $this->order_type,
            'delivery_address' => $this->delivery_address,
            'notes'            => $this->notes,
            'payment_status'   => $this->payment_status,
            'payment_method'   => $this->payment_method,
            'paid_at'          => $this->paid_at?->toDateTimeString(),

            // Helper flag so React knows to show cancel button
            'is_cancellable'   => $this->isCancellable(),

            // Only loaded when explicitly requested
            'items'            => OrderItemResource::collection(
                                    $this->whenLoaded('items')
                                  ),
            'user'             => new UserResource($this->whenLoaded('user')),
            'created_at'       => $this->created_at->toDateTimeString(),
            'updated_at'       => $this->updated_at->toDateTimeString(),
        ];
    }
}
