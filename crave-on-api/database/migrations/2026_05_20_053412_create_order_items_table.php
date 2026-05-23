<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('order_id')
                  ->constrained()
                  ->onDelete('cascade');

            /*
             * Nullable: if a product is soft-deleted later,
             * the order item still exists — we just lose the
             * FK link but keep the name/price snapshot below
             */
            $table->foreignId('product_id')
                  ->nullable()
                  ->constrained()
                  ->onDelete('set null');

            // Price & name snapshot — never changes
            // even if the product is later edited or deleted
            $table->string('product_name');
            $table->decimal('price_at_time', 8, 2);
            $table->unsignedInteger('quantity');
            $table->decimal('subtotal', 10, 2); // price_at_time × quantity

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
