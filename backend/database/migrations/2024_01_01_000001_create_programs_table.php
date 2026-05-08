<?php
// database/migrations/2024_01_01_000001_create_programs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();           // e.g. "hostinger"
            $table->string('category')->default('Other');
            $table->string('icon')->default('🔗');
            $table->string('color')->default('#f97316');
            $table->string('commission')->nullable();    // e.g. "20%" or "$50 flat"
            $table->enum('link_type', ['onetime', 'permanent'])->default('onetime');
            $table->text('affiliate_dashboard_url')->nullable(); // Hostinger affiliate panel link
            $table->integer('low_queue_threshold')->default(3);  // alert when queue drops below this
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('total_clicks')->default(0);
            $table->unsignedBigInteger('total_conversions')->default(0);
            $table->decimal('total_earnings', 10, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('programs');
    }
};
