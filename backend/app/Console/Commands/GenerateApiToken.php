<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class GenerateApiToken extends Command
{
    protected $signature   = 'token:generate {name=admin : Token name} {--email= : Admin email (creates user if missing)}';
    protected $description = 'Generate a Sanctum API token for the admin user';

    public function handle(): int
    {
        $email = $this->option('email') ?? config('referral.admin_email', 'admin@localhost');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $password = Str::random(16);
            $user = User::create([
                'name'     => 'Admin',
                'email'    => $email,
                'password' => Hash::make($password),
            ]);
            $this->info("Created admin user: {$email} / password: {$password}");
        } else {
            $this->info("Using existing user: {$user->email}");
        }

        $token = $user->createToken($this->argument('name'))->plainTextToken;

        $this->newLine();
        $this->line('  <fg=green;options=bold>API Token:</> ' . $token);
        $this->newLine();
        $this->line('  Add to your .env files:');
        $this->line('  NEXT_PUBLIC_REFERRAL_API_TOKEN=' . $token);
        $this->newLine();

        return self::SUCCESS;
    }
}
