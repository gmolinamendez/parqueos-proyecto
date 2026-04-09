<?php

namespace App\Policies;

use App\Models\Parqueo;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class ParqueoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    private function isAdministrador(Usuario $usuario)
    {
        return $usuario->hasPermission('manage_parqueos');
    }

    public function viewAny(Usuario $usuario): bool
    {
        return true;
    }

    public function view(Usuario $usuario, Parqueo $parqueo): bool
    {
        return true;
    }

    public function create(Usuario $usuario): bool
    {
        return $this->isAdministrador($usuario);
    }

    public function update(Usuario $usuario, Parqueo $parqueo): bool
    {
        return $this->isAdministrador($usuario);
    }

    public function delete(Usuario $usuario, Parqueo $parqueo): bool
    {
        return $this->isAdministrador($usuario);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(Usuario $usuario, Parqueo $parqueo): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(Usuario $usuario, Parqueo $parqueo): bool
    {
        return false;
    }
}
