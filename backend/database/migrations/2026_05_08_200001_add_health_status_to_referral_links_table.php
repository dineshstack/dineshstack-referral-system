<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('referral_links', function (Blueprint $table) {
            // 'unchecked' = never validated, 'ok' = last HEAD returned 2xx/3xx, 'dead' = returned error
            $table->enum('health_status', ['unchecked', 'ok', 'dead'])->default('unchecked')->after('notes');
            $table->timestamp('health_checked_at')->nullable()->after('health_status');
        });
    }

    public function down(): void
    {
        Schema::table('referral_links', function (Blueprint $table) {
            $table->dropColumn(['health_status', 'health_checked_at']);
        });
    }
};
