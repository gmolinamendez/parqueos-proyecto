<?php

namespace App\Policies;

use App\Models\Movimiento;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class MovimientoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    private function isAdministrador(Usuario $usuario)
    {
        return $usuario->rol && $usuario->rol->nombre === 'administrador';
    }

    private function isAdminOrVigilante(Usuario $usuario)
    {
        return $usuario->rol && in_array($usuario->rol->nombre, ['administrador', 'vigilante']);
    }

    public function registrar(Usuario $usuario): bool
    {
        return $usuario->hasPermission('registrar_movimientos');
    }

    public function viewActivos(Usuario $usuario): bool
    {
        return $usuario->hasPermission('view_movimientos_activos');
    }

    public function viewHistorial(Usuario $usuario): bool
    {
        return $usuario->hasPermission('view_historial');
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $usuario, Movimiento $movimiento): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $usuario, Movimiento $movimiento): bool
    {
        return false;
    }
}
