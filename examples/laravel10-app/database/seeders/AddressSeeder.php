<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AddressSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::first();
        $addresses = [
            ["Japan", "Tokyo"],
            ["Japan", "Osaka"],
            ["Japan", "Kyoto"],
        ];
        foreach ($addresses as $address) {
            Address::create(['user_id' => $user->id, 'country' => $address[0], 'city' => $address[1]]);
        }
    }
}
