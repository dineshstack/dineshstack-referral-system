<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create the dashboard admin user
        $user = User::firstOrCreate(
            ['email' => 'dinesh@dineshstack.com'],
            [
                'name'     => 'Dinesh',
                'password' => Hash::make('password'),
            ]
        );

        // Generate a Sanctum token (only on fresh seed)
        $token = $user->createToken('dashboard')->plainTextToken;
        $this->command->info("API Token: {$token}");
        $this->command->warn('Set this in your Next.js .env: NEXT_PUBLIC_API_TOKEN=' . $token);

        // Seed programs
        $this->call(ProgramSeeder::class);
    }
}
