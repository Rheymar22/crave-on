<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'slug'         => $this->slug,
            'description'  => $this->description,
            'price'        => (float) $this->price,
            'image_url'    => $this->image_url,
            'is_available' => (bool) $this->is_available,
            'stock'        => $this->stock,

            // Only included when load('category') is called
            'category'     => new CategoryResource($this->whenLoaded('category')),
            'created_at'   => $this->created_at->toDateTimeString(),
        ];
    }
}
