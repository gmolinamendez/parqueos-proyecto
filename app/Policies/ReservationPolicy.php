<?php

namespace App\Policies;

use App\Models\Reservation;
use App\Models\User;

class ReservationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasRole(['admin_parqueo', 'docente', 'estudiante']);
    }

    public function view(User $user, Reservation $reservation): bool
    {
        return $user->hasRole('admin_parqueo') || $reservation->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasRole(['admin_parqueo', 'docente', 'estudiante']);
    }

    public function cancel(User $user, Reservation $reservation): bool
    {
        return $user->hasRole('admin_parqueo') || $reservation->user_id === $user->id;
    }
}
