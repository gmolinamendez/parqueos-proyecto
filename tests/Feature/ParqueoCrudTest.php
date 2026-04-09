<?php

namespace Tests\Feature;

use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Permiso;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ParqueoCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_administrador_puede_crear_parqueo()
    {
        $rolAdmin = Rol::create(['nombre' => 'administrador']);
        $permiso = Permiso::create(['nombre' => 'manage_parqueos']);
        $rolAdmin->permisos()->attach($permiso->id);

        $admin = Usuario::create([
            'nombre' => 'Admin Test',
            'email' => 'admin@test.com',
            'password' => bcrypt('password'),
            'rol_id' => $rolAdmin->id,
            'estado' => true
        ]);

        $response = $this->actingAs($admin)->postJson('/api/parqueos', [
            'nombre' => 'Parqueo Norte',
            'ubicacion' => 'Bloque A',
            'cupos_maximos' => 50
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('data.nombre', 'Parqueo Norte')
                 ->assertJsonPath('data.cupos_maximos', 50);

        $this->assertDatabaseHas('parqueos', [
            'nombre' => 'Parqueo Norte'
        ]);
    }

    public function test_estudiante_no_puede_crear_parqueo()
    {
        $rolEstudiante = Rol::create(['nombre' => 'estudiante']);
        // Estudiante does not get the manage_parqueos permission
        
        $estudiante = Usuario::create([
            'nombre' => 'Estudiante Test',
            'email' => 'estudiante@test.com',
            'password' => bcrypt('password'),
            'rol_id' => $rolEstudiante->id,
            'estado' => true
        ]);

        $response = $this->actingAs($estudiante)->postJson('/api/parqueos', [
            'nombre' => 'Parqueo Sur',
            'ubicacion' => 'Bloque B',
            'cupos_maximos' => 30
        ]);

        $response->assertStatus(403);
    }
}
