<?php

namespace Database\Factories;

use App\Models\ParkingSpot;
use App\Models\Reservation;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Reservation> */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $startAt = now()->addHour();
        $endAt = (clone $startAt)->addHour();

        return [
            'requester_name' => $this->faker->name(),
            'user_id' => User::factory(),
            'parking_spot_id' => ParkingSpot::factory(),
            'start_at' => $startAt,
            'end_at' => $endAt,
            'status' => Reservation::STATUS_ACTIVE,
            'cancelled_at' => null,
        ];
    }
}
