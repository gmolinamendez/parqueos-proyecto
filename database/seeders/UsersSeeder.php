<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::factory()->create([
            'name' => 'Admin Parqueo',
            'email' => 'admin.parqueo@example.com',
        ]);
        $admin->assignRole('admin_parqueo');

        $docente = User::factory()->create([
            'name' => 'Docente Demo',
            'email' => 'docente@example.com',
        ]);
        $docente->assignRole('docente');

        $estudiante = User::factory()->create([
            'name' => 'Estudiante Demo',
            'email' => 'estudiante@example.com',
        ]);
        $estudiante->assignRole('estudiante');
    }
}
