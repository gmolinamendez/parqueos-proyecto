<?php

use App\Models\ParkingSpot;
use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin_parqueo');
    Role::findOrCreate('docente');
    Role::findOrCreate('estudiante');
});

test('listar spots autenticado', function () {
    ParkingSpot::factory()->count(2)->create();

    $user = User::factory()->create();
    $user->assignRole('docente');

    $this->actingAs($user, 'sanctum')
        ->getJson('/api/v1/parking-spots')
        ->assertOk()
        ->assertJsonPath('status', 'success');
});

test('crear spot como admin', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin_parqueo');

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/parking-spots', [
            'code' => 'P-A101',
            'zone' => 'A',
            'is_active' => true,
            'is_occupied' => false,
        ])
        ->assertCreated()
        ->assertJsonPath('status', 'success');

    $this->assertDatabaseHas('parking_spots', ['code' => 'P-A101']);
});

test('crear editar eliminar spot sin rol admin retorna 403', function () {
    $user = User::factory()->create();
    $user->assignRole('estudiante');

    $spot = ParkingSpot::factory()->create();

    $this->actingAs($user, 'sanctum')
        ->postJson('/api/v1/parking-spots', [
            'code' => 'P-B201',
            'zone' => 'B',
            'is_active' => true,
            'is_occupied' => false,
        ])
        ->assertForbidden();

    $this->actingAs($user, 'sanctum')
        ->putJson("/api/v1/parking-spots/{$spot->id}", [
            'code' => $spot->code,
            'zone' => 'C',
            'is_active' => true,
            'is_occupied' => false,
        ])
        ->assertForbidden();

    $this->actingAs($user, 'sanctum')
        ->deleteJson("/api/v1/parking-spots/{$spot->id}")
        ->assertForbidden();
});

test('validaciones de parking spot retornan 422', function () {
    $admin = User::factory()->create();
    $admin->assignRole('admin_parqueo');

    ParkingSpot::factory()->create(['code' => 'P-UNIQUE']);

    $this->actingAs($admin, 'sanctum')
        ->postJson('/api/v1/parking-spots', [
            'code' => 'P-UNIQUE',
            'zone' => '',
            'is_active' => 'invalid',
            'is_occupied' => 'invalid',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('status', 'error');
});
