<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Human-readable e.g. ORD-20240520-0001
            $table->string('order_number')->unique();

            $table->enum('status', [
                'pending',    // just placed, awaiting confirmation
                'confirmed',  // admin acknowledged
                'preparing',  // being prepared
                'ready',      // ready for pickup or delivery
                'completed',  // finished
                'cancelled',  // cancelled
            ])->default('pending');

            $table->decimal('subtotal', 10, 2);
            $table->decimal('tax', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            // Pickup or delivery
            $table->enum('order_type', ['pickup', 'delivery'])
                  ->default('pickup');
            $table->text('delivery_address')->nullable();
            $table->text('notes')->nullable();

            // Mock payment tracking
            $table->enum('payment_status', ['unpaid', 'paid', 'refunded'])
                  ->default('unpaid');
            $table->string('payment_method')->nullable(); // cash, card, gcash
            $table->timestamp('paid_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
