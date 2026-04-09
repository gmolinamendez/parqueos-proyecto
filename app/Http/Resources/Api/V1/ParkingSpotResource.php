<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ParkingSpotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'zone' => $this->zone,
            'is_active' => $this->is_active,
            'is_occupied' => $this->is_occupied,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
