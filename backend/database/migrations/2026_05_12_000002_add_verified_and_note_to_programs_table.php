<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->string('exclusive_note', 200)->nullable()->after('referral_benefit');
            $table->timestamp('last_verified_at')->nullable()->after('exclusive_note');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['exclusive_note', 'last_verified_at']);
        });
    }
};
