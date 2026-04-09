<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Resources\VehiculoResource;
use App\Http\Requests\Vehiculo\StoreVehiculoRequest;
use App\Http\Requests\Vehiculo\UpdateVehiculoRequest;
use App\Models\Vehiculo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class VehiculoController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request)
    {
        $this->authorize('viewAny', Vehiculo::class);
        $query = Vehiculo::with('propietario');
        
        if ($request->has('placa')) {
            $query->where('placa', 'like', '%' . $request->placa . '%');
        }
        
        return VehiculoResource::collection($query->paginate());
    }

    public function store(StoreVehiculoRequest $request)
    {
        $this->authorize('create', Vehiculo::class);
        $vehiculo = Vehiculo::create($request->validated());
        return new VehiculoResource($vehiculo);
    }

    public function show(Vehiculo $vehiculo)
    {
        $this->authorize('view', $vehiculo);
        return new VehiculoResource($vehiculo->load('propietario'));
    }

    public function update(UpdateVehiculoRequest $request, Vehiculo $vehiculo)
    {
        $this->authorize('update', $vehiculo);
        $vehiculo->update($request->validated());
        return new VehiculoResource($vehiculo);
    }

    public function destroy(Vehiculo $vehiculo)
    {
        $this->authorize('delete', $vehiculo);
        $vehiculo->delete();
        return response()->noContent();
    }
}
