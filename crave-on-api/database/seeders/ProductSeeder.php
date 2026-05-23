<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ── Hot Drinks ─────────────────────────────────
            [
                'category' => 'hot',
                'name'     => 'Espresso',
                'price'    => 120,
                'desc'     => 'Bold and concentrated — a pure shot of Crave On.',
            ],
            [
                'category' => 'hot',
                'name'     => 'Cappuccino',
                'price'    => 165,
                'desc'     => 'Espresso topped with steamed milk and thick foam.',
            ],
            [
                'category' => 'hot',
                'name'     => 'Caramel Latte',
                'price'    => 185,
                'desc'     => 'Smooth latte with golden caramel drizzle.',
            ],
            [
                'category' => 'hot',
                'name'     => 'Americano',
                'price'    => 140,
                'desc'     => 'Espresso diluted with hot water for a clean, bold taste.',
            ],

            // ── Iced Drinks ────────────────────────────────
            [
                'category' => 'iced',
                'name'     => 'Iced Latte',
                'price'    => 175,
                'desc'     => 'Chilled espresso over ice with cold milk.',
            ],
            [
                'category' => 'iced',
                'name'     => 'Cold Brew',
                'price'    => 195,
                'desc'     => 'Steeped 12 hours for a smooth, less-acidic brew.',
            ],
            [
                'category' => 'iced',
                'name'     => 'Iced Matcha Latte',
                'price'    => 185,
                'desc'     => 'Ceremonial-grade matcha with oat milk over ice.',
            ],
            [
                'category' => 'iced',
                'name'     => 'Frappuccino',
                'price'    => 210,
                'desc'     => 'Blended iced coffee finished with whipped cream.',
            ],

            // ── Pastries ───────────────────────────────────
            [
                'category' => 'pastries',
                'name'     => 'Butter Croissant',
                'price'    => 95,
                'desc'     => 'Freshly baked, flaky, and buttery every morning.',
            ],
            [
                'category' => 'pastries',
                'name'     => 'Blueberry Muffin',
                'price'    => 85,
                'desc'     => 'Moist muffin bursting with fresh blueberries.',
            ],
            [
                'category' => 'pastries',
                'name'     => 'Cinnamon Roll',
                'price'    => 110,
                'desc'     => 'Warm roll with cinnamon swirl and cream cheese glaze.',
            ],

            // ── Coffee Beans ───────────────────────────────
            [
                'category' => 'beans',
                'name'     => 'Arabica Blend 250g',
                'price'    => 395,
                'desc'     => 'Smooth Ethiopian-Colombian blend with bright citrus notes.',
            ],
            [
                'category' => 'beans',
                'name'     => 'Dark Roast 250g',
                'price'    => 375,
                'desc'     => 'Intense and smoky — perfect for espresso lovers.',
            ],
        ];

        foreach ($products as $item) {
            $category = Category::where('slug', $item['category'])->first();
            if (! $category) continue;

            Product::updateOrCreate(
                ['slug' => Str::slug($item['name'])],
                [
                    'category_id'  => $category->id,
                    'name'         => $item['name'],
                    'slug'         => Str::slug($item['name']),
                    'description'  => $item['desc'],
                    'price'        => $item['price'],
                    'is_available' => true,
                    'stock'        => rand(15, 60),
                ]
            );
        }
    }
}
