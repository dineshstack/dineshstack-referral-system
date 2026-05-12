<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('link_health_checks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('link_id')->constrained('referral_links')->cascadeOnDelete();
            $table->timestamp('checked_at');
            $table->boolean('is_healthy');
            $table->smallInteger('status_code')->nullable();
            $table->unsignedSmallInteger('response_time_ms')->nullable();

            $table->index(['link_id', 'checked_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('link_health_checks');
    }
};
