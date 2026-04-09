<?php

namespace App\Http\Requests\Api\V1\ParkingSpot;

use App\Http\Requests\Api\ApiFormRequest;
use Illuminate\Validation\Rule;

class UpdateParkingSpotRequest extends ApiFormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $spot = $this->route('parking_spot') ?? $this->route('parkingSpot');

        return [
            'code' => [
                'required',
                'string',
                'max:40',
                Rule::unique('parking_spots', 'code')->ignore($spot),
            ],
            'zone' => ['required', 'string', 'max:80'],
            'is_active' => ['required', 'boolean'],
            'is_occupied' => ['required', 'boolean'],
        ];
    }
}
