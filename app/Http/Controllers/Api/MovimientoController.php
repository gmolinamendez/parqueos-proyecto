<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Resources\MovimientoResource;
use App\Http\Requests\Movimiento\RegistrarEntradaRequest;
use App\Http\Requests\Movimiento\RegistrarSalidaRequest;
use App\Models\Movimiento;
use App\Models\Vehiculo;
use App\Models\Parqueo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Validation\ValidationException;

class MovimientoController extends Controller
{
    use AuthorizesRequests;

    public function entrada(RegistrarEntradaRequest $request)
    {
        $this->authorize('registrar', Movimiento::class);
        $data = $request->validated();
        
        $vehiculo = Vehiculo::where('placa', $data['placa'])->firstOrFail();
        $parqueo = Parqueo::findOrFail($data['parqueo_id']);
        
        if ($vehiculo->movimientos()->activos()->exists()) {
            throw ValidationException::withMessages(['placa' => 'El vehículo ya tiene una entrada activa.']);
        }
        
        if ($parqueo->cupos_disponibles <= 0) {
            throw ValidationException::withMessages(['parqueo_id' => 'El parqueo seleccionado no tiene cupos disponibles.']);
        }
        
        $movimiento = Movimiento::create([
            'vehiculo_id' => $vehiculo->id,
            'parqueo_id' => $parqueo->id,
        ]);
        
        return new MovimientoResource($movimiento);
    }

    public function salida(RegistrarSalidaRequest $request)
    {
        $this->authorize('registrar', Movimiento::class);
        $data = $request->validated();
        
        $vehiculo = Vehiculo::where('placa', $data['placa'])->firstOrFail();
        $parqueo = Parqueo::findOrFail($data['parqueo_id']);
        
        $movimiento = Movimiento::where('vehiculo_id', $vehiculo->id)
            ->where('parqueo_id', $parqueo->id)
            ->activos()
            ->first();
            
        if (!$movimiento) {
            throw ValidationException::withMessages(['placa' => 'No se encontró una entrada activa para este vehículo en este parqueo.']);
        }
        
        $movimiento->update(['fecha_salida' => now()]);
        
        return new MovimientoResource($movimiento);
    }

    public function activos(Request $request)
    {
        $this->authorize('viewActivos', Movimiento::class);
        
        $query = Movimiento::with(['vehiculo', 'parqueo'])->activos();
        
        if ($request->has('parqueo_id')) {
            $query->where('parqueo_id', $request->parqueo_id);
        }
        
        return MovimientoResource::collection($query->get());
    }

    public function historial(Request $request)
    {
        $this->authorize('viewHistorial', Movimiento::class);
        
        $query = Movimiento::with(['vehiculo', 'parqueo']);
        
        if ($request->has('parqueo_id')) {
            $query->where('parqueo_id', $request->parqueo_id);
        }
        if ($request->has('fecha_inicio')) {
            $query->whereDate('fecha_entrada', '>=', $request->fecha_inicio);
        }
        if ($request->has('fecha_fin')) {
            $query->whereDate('fecha_entrada', '<=', $request->fecha_fin);
        }
        
        return MovimientoResource::collection($query->paginate());
    }
}
