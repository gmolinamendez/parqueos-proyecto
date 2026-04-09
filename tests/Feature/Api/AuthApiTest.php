<?php

use App\Models\User;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin_parqueo');
});

test('login exitoso', function () {
    $user = User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);
    $user->assignRole('admin_parqueo');

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@example.com',
        'password' => 'password',
        'device_name' => 'feature-test',
    ]);

    $response
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Login successful.')
        ->assertJsonStructure(['data' => ['token', 'token_type', 'user']]);
});

test('login invalido', function () {
    User::factory()->create([
        'email' => 'admin@example.com',
        'password' => 'password',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin@example.com',
        'password' => 'invalid-password',
    ]);

    $response
        ->assertUnauthorized()
        ->assertJsonPath('status', 'error');
});

test('profile con token', function () {
    $user = User::factory()->create();
    $user->assignRole('admin_parqueo');
    $token = $user->createToken('test')->plainTextToken;

    $response = $this->withToken($token)->getJson('/api/v1/auth/profile');

    $response
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $user->id);
});

test('logout invalida token', function () {
    $user = User::factory()->create();
    $user->assignRole('admin_parqueo');
    $token = $user->createToken('test')->plainTextToken;
    $plainToken = explode('|', $token)[1];

    $logoutResponse = $this->withToken($token)->postJson('/api/v1/auth/logout');
    $logoutResponse->assertOk();

    $this->assertDatabaseMissing('personal_access_tokens', [
        'token' => hash('sha256', $plainToken),
    ]);
});

test('endpoint protegido sin token retorna 401', function () {
    $this->getJson('/api/v1/auth/profile')->assertUnauthorized();
    $this->getJson('/api/v1/parking-spots')->assertUnauthorized();
    $this->getJson('/api/v1/reservations')->assertUnauthorized();
});
