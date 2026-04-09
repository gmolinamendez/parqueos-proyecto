<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'parking-spots.view',
            'parking-spots.create',
            'parking-spots.update',
            'parking-spots.delete',
            'reservations.view-all',
            'reservations.create',
            'reservations.cancel',
            'reservations.view-own',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission);
        }

        $adminRole = Role::findOrCreate('admin_parqueo');
        $docenteRole = Role::findOrCreate('docente');
        $estudianteRole = Role::findOrCreate('estudiante');

        $adminRole->syncPermissions($permissions);
        $docenteRole->syncPermissions(['parking-spots.view', 'reservations.create', 'reservations.cancel', 'reservations.view-own']);
        $estudianteRole->syncPermissions(['parking-spots.view', 'reservations.create', 'reservations.cancel', 'reservations.view-own']);
    }
}
