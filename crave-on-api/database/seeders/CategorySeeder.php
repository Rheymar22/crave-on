<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Hot Drinks',   'slug' => 'hot',      'icon' => '☕'],
            ['name' => 'Iced Drinks',  'slug' => 'iced',     'icon' => '🧊'],
            ['name' => 'Pastries',     'slug' => 'pastries', 'icon' => '🥐'],
            ['name' => 'Coffee Beans', 'slug' => 'beans',    'icon' => '🫘'],
        ];

        foreach ($categories as $data) {
            Category::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );
        }
    }
}
