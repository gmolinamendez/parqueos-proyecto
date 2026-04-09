<?php

namespace Database\Seeders;

use App\Models\ParkingSpot;
use Illuminate\Database\Seeder;

class ParkingDataSeeder extends Seeder
{
    public function run(): void
    {
        ParkingSpot::factory()->count(10)->create();

        ParkingSpot::factory()->create([
            'code' => 'P-ZN01',
            'zone' => 'Norte',
            'is_active' => false,
            'is_occupied' => false,
        ]);
    }
}
