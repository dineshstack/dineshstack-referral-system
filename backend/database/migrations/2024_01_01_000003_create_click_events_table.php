<?php
// database/migrations/2024_01_01_000003_create_click_events_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('click_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('referral_link_id')->nullable()->constrained()->nullOnDelete();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->string('referer')->nullable();       // where the click came from
            $table->string('country', 2)->nullable();
            $table->boolean('link_was_rotated')->default(false); // did this click trigger a rotation?
            $table->timestamps();

            $table->index(['program_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('click_events');
    }
};
