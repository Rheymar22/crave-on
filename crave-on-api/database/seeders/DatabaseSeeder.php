<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeeder::class,  // first — products depend on it
            UserSeeder::class,
            ProductSeeder::class,   // last — depends on categories
        ]);
    }
}
