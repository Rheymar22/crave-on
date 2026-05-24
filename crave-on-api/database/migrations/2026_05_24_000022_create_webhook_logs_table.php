<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('webhook_id')
                  ->constrained()
                  ->onDelete('cascade');

            // Which event triggered this delivery
            $table->string('event');

            // The payload we sent
            $table->json('payload');

            // Response from the target server
            $table->integer('response_status')->nullable();
            $table->text('response_body')->nullable();

            // How long delivery took in milliseconds
            $table->integer('duration_ms')->nullable();

            $table->enum('status', ['success', 'failed', 'pending'])
                  ->default('pending');

            $table->text('error_message')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_logs');
    }
};
