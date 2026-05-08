<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            // Fire a second, louder alert at this count (should be < low_queue_threshold)
            $table->integer('critical_queue_threshold')->default(1)->after('low_queue_threshold');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn('critical_queue_threshold');
        });
    }
};