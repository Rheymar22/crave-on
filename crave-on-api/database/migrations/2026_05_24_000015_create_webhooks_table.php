<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhooks', function (Blueprint $table) {
            $table->id();

            // Who registered this webhook
            $table->foreignId('user_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Friendly name e.g. "Slack Order Notifier"
            $table->string('name');

            // Where to POST events
            $table->string('url');

            /*
            | Which events trigger this webhook:
            | order.created, order.status_updated,
            | order.cancelled, product.created,
            | product.updated, product.deleted
            */
            $table->json('events');

            // Secret for HMAC signature verification
            $table->string('secret');

            $table->boolean('is_active')->default(true);

            // Track delivery stats
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('failure_count')->default(0);
            $table->timestamp('last_triggered_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhooks');
    }
};
