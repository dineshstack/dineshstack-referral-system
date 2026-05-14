<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            // Pricing label shown on deal card: "Free", "Freemium", "From $5/mo", "$99/yr" etc.
            $table->string('pricing_label', 60)->nullable()->after('commission');

            // Comma-separated integration names: "GitHub,Vercel,Slack"
            $table->string('integrations', 500)->nullable()->after('review_url');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['pricing_label', 'integrations']);
        });
    }
};
