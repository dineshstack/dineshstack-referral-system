<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('click_events', function (Blueprint $table) {
            $table->string('utm_source')->nullable()->after('referer');
            $table->string('utm_medium')->nullable()->after('utm_source');
            $table->string('utm_campaign')->nullable()->after('utm_medium');
            $table->boolean('is_bot')->default(false)->after('link_was_rotated');
        });
    }

    public function down(): void
    {
        Schema::table('click_events', function (Blueprint $table) {
            $table->dropColumn(['utm_source', 'utm_medium', 'utm_campaign', 'is_bot']);
        });
    }
};
