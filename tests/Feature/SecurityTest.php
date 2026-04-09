<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_rutas_protegidas_requieren_autenticacion()
    {
        $response = $this->getJson('/api/parqueos');
        $response->assertStatus(401);

        $response = $this->postJson('/api/vehiculos', []);
        $response->assertStatus(401);
    }
}
