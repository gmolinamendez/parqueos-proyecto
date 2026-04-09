<?php

namespace App\Policies;

use App\Models\Usuario;
use App\Models\Vehiculo;
use Illuminate\Auth\Access\Response;

class VehiculoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    private function isAdminOrVigilante(Usuario $usuario)
    {
        return $usuario->rol && in_array($usuario->rol->nombre, ['administrador', 'vigilante']);
    }

    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->hasPermission('view_vehiculos');
    }

    public function view(Usuario $usuario, Vehiculo $vehiculo): bool
    {
        return $usuario->hasPermission('view_vehiculos');
    }

    public function create(Usuario $usuario): bool
    {
        return $usuario->hasPermission('create_vehiculos');
    }

    public function update(Usuario $usuario, Vehiculo $vehiculo): bool
    {
        return $usuario->hasPermission('manage_vehiculos');
    }

    public function delete(Usuario $usuario, Vehiculo $vehiculo): bool
    {
        return $usuario->hasPermission('manage_vehiculos');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $usuario, Vehiculo $vehiculo): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $usuario, Vehiculo $vehiculo): bool
    {
        return false;
    }
}
