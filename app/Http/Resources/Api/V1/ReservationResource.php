<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requester_name' => $this->requester_name,
            'user_id' => $this->user_id,
            'parking_spot_id' => $this->parking_spot_id,
            'spot_code' => $this->whenLoaded('parkingSpot', fn () => $this->parkingSpot?->code),
            'start_at' => $this->start_at,
            'end_at' => $this->end_at,
            'status' => $this->status,
            'cancelled_at' => $this->cancelled_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
