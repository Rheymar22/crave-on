<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();

            // Link to categories — restricted delete
            // (can't delete a category if products exist under it)
            $table->foreignId('category_id')
                  ->constrained()
                  ->onDelete('restrict');

            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();

            // Stores up to 99999.99
            $table->decimal('price', 8, 2);

            $table->string('image_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->unsignedInteger('stock')->default(0);

            $table->timestamps();

            /*
             * Soft deletes — when admin removes a product,
             * it stays in the DB so old order history
             * still shows the correct product name & price
             */
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
