<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            // First-person "why I recommend" paragraph shown on public card
            $table->text('description')->nullable()->after('referral_benefit');

            // Dinesh's personal star rating (1–5)
            $table->unsignedTinyInteger('my_rating')->nullable()->after('description');

            // Year Dinesh started using the tool — "Using since 2021"
            $table->unsignedSmallInteger('using_since')->nullable()->after('my_rating');

            // Third-party review score (e.g. G2 4.6) + source URL
            $table->decimal('review_score', 2, 1)->nullable()->after('using_since');
            $table->string('review_url', 500)->nullable()->after('review_score');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['description', 'my_rating', 'using_since', 'review_score', 'review_url']);
        });
    }
};
