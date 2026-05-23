<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        User::updateOrCreate(
            ['email' => 'admin@craveon.com'],
            [
                'name'     => 'Crave On Admin',
                'password' => Hash::make('password'),
                'role'     => 'admin',
                'phone'    => '09001234567',
            ]
        );

        // Demo customer
        User::updateOrCreate(
            ['email' => 'customer@craveon.com'],
            [
                'name'     => 'Demo Customer',
                'password' => Hash::make('password'),
                'role'     => 'customer',
                'phone'    => '09007654321',
            ]
        );
    }
}
