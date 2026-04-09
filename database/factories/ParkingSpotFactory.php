<?php

namespace Database\Factories;

use App\Models\ParkingSpot;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ParkingSpot> */
class ParkingSpotFactory extends Factory
{
    protected $model = ParkingSpot::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper($this->faker->bothify('P-##??')),
            'zone' => $this->faker->randomElement(['A', 'B', 'C']),
            'is_active' => true,
            'is_occupied' => false,
        ];
    }
}
