<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MovimientoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehiculo_id' => $this->vehiculo_id,
            'vehiculo_placa' => $this->vehiculo ? $this->vehiculo->placa : null,
            'parqueo_id' => $this->parqueo_id,
            'parqueo_nombre' => $this->parqueo ? $this->parqueo->nombre : null,
            'fecha_entrada' => $this->fecha_entrada,
            'fecha_salida' => $this->fecha_salida,
        ];
    }
}
