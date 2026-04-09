<?php

namespace App\Policies;

use App\Models\ParkingSpot;
use App\Models\User;

class ParkingSpotPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin_parqueo', 'docente', 'estudiante']);
    }

    public function view(User $user, ParkingSpot $parkingSpot): bool
    {
        return $user->hasRole(['admin_parqueo', 'docente', 'estudiante']);
    }

    public function create(User $user): bool
    {
        return $user->hasRole('admin_parqueo');
    }

    public function update(User $user, ParkingSpot $parkingSpot): bool
    {
        return $user->hasRole('admin_parqueo');
    }

    public function delete(User $user, ParkingSpot $parkingSpot): bool
    {
        return $user->hasRole('admin_parqueo');
    }
}
