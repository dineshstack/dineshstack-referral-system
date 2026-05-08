<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('postback_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('program_id')->constrained()->cascadeOnDelete();
            $table->foreignId('click_event_id')->nullable()->constrained()->nullOnDelete();
            // 'sale', 'lead', 'trial', 'refund' — whatever the affiliate network sends
            $table->string('event_type')->default('sale');
            $table->decimal('amount', 10, 2)->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('transaction_id')->nullable()->unique();
            $table->json('raw_payload');
            $table->timestamps();

            $table->index(['program_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('postback_events');
    }
};