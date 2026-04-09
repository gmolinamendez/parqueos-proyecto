<?php

namespace App\Http\Requests\Api\V1\Reservation;

use App\Http\Requests\Api\ApiFormRequest;
use App\Models\Reservation;
use Illuminate\Validation\Rule;

class StoreReservationRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'requester_name' => ['required', 'string', 'max:120'],
            'parking_spot_id' => ['required', 'integer', 'exists:parking_spots,id'],
            'start_at' => ['required', 'date'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'status' => ['sometimes', Rule::in([Reservation::STATUS_ACTIVE])],
        ];
    }
}
