<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Resources\ParqueoResource;
use App\Http\Requests\Parqueo\StoreParqueoRequest;
use App\Http\Requests\Parqueo\UpdateParqueoRequest;
use App\Models\Parqueo;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class ParqueoController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Parqueo::class);
        return ParqueoResource::collection(Parqueo::paginate());
    }

    public function store(StoreParqueoRequest $request)
    {
        $this->authorize('create', Parqueo::class);
        $parqueo = Parqueo::create($request->validated());
        return new ParqueoResource($parqueo);
    }

    public function show(Parqueo $parqueo)
    {
        $this->authorize('view', $parqueo);
        return new ParqueoResource($parqueo);
    }

    public function update(UpdateParqueoRequest $request, Parqueo $parqueo)
    {
        $this->authorize('update', $parqueo);
        $parqueo->update($request->validated());
        return new ParqueoResource($parqueo);
    }

    public function destroy(Parqueo $parqueo)
    {
        $this->authorize('delete', $parqueo);
        $parqueo->delete();
        return response()->noContent();
    }
    
    public function disponibilidad(Parqueo $parqueo)
    {
        $this->authorize('view', $parqueo);
        return response()->json([
            'cupos_maximos' => $parqueo->cupos_maximos,
            'cupos_ocupados' => $parqueo->movimientos()->activos()->count(),
            'cupos_disponibles' => $parqueo->cupos_disponibles
        ]);
    }
}
