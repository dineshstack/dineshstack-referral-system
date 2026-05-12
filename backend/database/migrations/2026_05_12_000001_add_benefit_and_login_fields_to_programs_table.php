<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->text('referral_benefit')->nullable()->after('affiliate_dashboard_url');
            $table->string('login_email', 200)->nullable()->after('referral_benefit');
            $table->string('login_password', 200)->nullable()->after('login_email');
            $table->string('login_method', 100)->nullable()->after('login_password');
        });
    }

    public function down(): void
    {
        Schema::table('programs', function (Blueprint $table) {
            $table->dropColumn(['referral_benefit', 'login_email', 'login_password', 'login_method']);
        });
    }
};
