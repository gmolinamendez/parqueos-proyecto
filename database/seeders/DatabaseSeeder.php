<?php

namespace Database\Seeders;

use App\Models\Rol;
use App\Models\Usuario;
use App\Models\Parqueo;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminRol = Rol::firstOrCreate(['nombre' => 'administrador']);
        $vigilanteRol = Rol::firstOrCreate(['nombre' => 'vigilante']);
        Rol::firstOrCreate(['nombre' => 'estudiante']);

        Usuario::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'nombre' => 'Admin User',
                'password' => Hash::make('admin123'),
                'rol_id' => $adminRol->id,
                'estado' => true
            ]
        );

        Usuario::firstOrCreate(
            ['email' => 'vigilante@demo.com'],
            [
                'nombre' => 'Vigilante User',
                'password' => Hash::make('vigilante123'),
                'rol_id' => $vigilanteRol->id,
                'estado' => true
            ]
        );

        Parqueo::firstOrCreate(
            ['nombre' => 'Parqueo Académico'],
            [
                'ubicacion' => 'Campus Central',
                'cupos_maximos' => 100
            ]
        );
    }
}
