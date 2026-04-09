<?php

namespace App\Http\Requests\Api\V1\ParkingSpot;

use App\Http\Requests\Api\ApiFormRequest;

class StoreParkingSpotRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'max:40', 'unique:parking_spots,code'],
            'zone' => ['required', 'string', 'max:80'],
            'is_active' => ['sometimes', 'boolean'],
            'is_occupied' => ['sometimes', 'boolean'],
        ];
    }
}
