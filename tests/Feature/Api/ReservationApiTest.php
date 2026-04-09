<?php

use App\Models\ParkingSpot;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin_parqueo');
    Role::findOrCreate('docente');
    Role::findOrCreate('estudiante');
});

test('crear reserva valida', function () {
    Carbon::setTestNow('2026-04-08 08:00:00');

    $user = User::factory()->create();
    $user->assignRole('docente');

    $spot = ParkingSpot::factory()->create([
        'is_active' => true,
        'is_occupied' => false,
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/reservations', [
            'requester_name' => 'Docente Uno',
            'parking_spot_id' => $spot->id,
            'start_at' => '2026-04-08 08:30:00',
            'end_at' => '2026-04-08 10:00:00',
        ])
        ->assertCreated()
        ->assertJsonPath('status', 'success');
});

test('no crear reserva con conflicto de horario', function () {
    $user = User::factory()->create();
    $user->assignRole('docente');

    $spot = ParkingSpot::factory()->create();

    Reservation::factory()->create([
        'parking_spot_id' => $spot->id,
        'start_at' => '2026-04-08 09:00:00',
        'end_at' => '2026-04-08 11:00:00',
        'status' => Reservation::STATUS_ACTIVE,
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/reservations', [
            'requester_name' => 'Docente Dos',
            'parking_spot_id' => $spot->id,
            'start_at' => '2026-04-08 10:00:00',
            'end_at' => '2026-04-08 12:00:00',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('status', 'error');
});

test('no crear reserva en spot inactivo u ocupado', function () {
    $user = User::factory()->create();
    $user->assignRole('estudiante');

    $inactiveSpot = ParkingSpot::factory()->create([
        'is_active' => false,
        'is_occupied' => false,
    ]);

    $occupiedSpot = ParkingSpot::factory()->create([
        'is_active' => true,
        'is_occupied' => true,
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/reservations', [
            'requester_name' => 'Estudiante Uno',
            'parking_spot_id' => $inactiveSpot->id,
            'start_at' => '2026-04-08 10:00:00',
            'end_at' => '2026-04-08 11:00:00',
        ])
        ->assertUnprocessable();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/reservations', [
            'requester_name' => 'Estudiante Uno',
            'parking_spot_id' => $occupiedSpot->id,
            'start_at' => '2026-04-08 10:00:00',
            'end_at' => '2026-04-08 11:00:00',
        ])
        ->assertUnprocessable();
});

test('cancelar reserva activa', function () {
    $user = User::factory()->create();
    $user->assignRole('docente');

    $spot = ParkingSpot::factory()->create(['is_occupied' => true]);

    $reservation = Reservation::factory()->create([
        'user_id' => $user->id,
        'parking_spot_id' => $spot->id,
        'status' => Reservation::STATUS_ACTIVE,
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/reservations/{$reservation->id}/cancel")
        ->assertOk()
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseHas('reservations', [
        'id' => $reservation->id,
        'status' => Reservation::STATUS_CANCELLED,
    ]);

    $this->assertDatabaseHas('parking_spots', [
        'id' => $spot->id,
        'is_occupied' => false,
    ]);
});

test('no cancelar reserva ya cancelada', function () {
    $user = User::factory()->create();
    $user->assignRole('estudiante');

    $reservation = Reservation::factory()->create([
        'user_id' => $user->id,
        'status' => Reservation::STATUS_CANCELLED,
        'cancelled_at' => now(),
    ]);

    $this->actingAs($user, 'sanctum')
        ->postJson("/api/v1/reservations/{$reservation->id}/cancel")
        ->assertUnprocessable()
        ->assertJsonPath('status', 'error');
});

test('historial o listado autenticado', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin_parqueo');

    $user = User::factory()->create();
    $user->assignRole('docente');

    Reservation::factory()->count(2)->create(['user_id' => $user->id]);

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/reservations')
        ->assertOk()
        ->assertJsonPath('status', 'success');

    $this->actingAs($admin, 'sanctum')
        ->getJson('/api/v1/reservations')
        ->assertOk()
        ->assertJsonPath('status', 'success');
});

test('reservas sin autenticacion retorna 401', function () {
    $this->getJson('/api/v1/reservations')->assertUnauthorized();
    $this->postJson('/api/v1/reservations', [])->assertUnauthorized();
});
