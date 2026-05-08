<?php
// database/migrations/2024_01_01_000002_create_referral_links_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('referral_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->text('url');
            // queued = waiting, active = currently serving, used = consumed, expired = manually removed
            $table->enum('status', ['queued', 'active', 'used', 'expired'])->default('queued');
            $table->integer('position')->default(0);    // ordering within the queue
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();

            $table->index(['program_id', 'status', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_links');
    }
};
