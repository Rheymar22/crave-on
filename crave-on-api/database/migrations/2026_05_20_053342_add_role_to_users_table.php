<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Role: admin or customer
            $table->enum('role', ['customer', 'admin'])
                  ->default('customer')
                  ->after('email');

            // Optional profile fields
            $table->string('phone')->nullable()->after('role');
            $table->text('address')->nullable()->after('phone');
            $table->string('avatar')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'address', 'avatar']);
        });
    }
};
