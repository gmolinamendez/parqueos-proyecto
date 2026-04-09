<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Resources\UsuarioResource;
use App\Http\Requests\Usuario\StoreUsuarioRequest;
use App\Http\Requests\Usuario\UpdateUsuarioRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UsuarioController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('viewAny', Usuario::class);
        return UsuarioResource::collection(Usuario::with('rol')->paginate());
    }

    public function store(StoreUsuarioRequest $request)
    {
        $this->authorize('create', Usuario::class);
        
        $data = $request->validated();
        $data['password'] = Hash::make($data['password']);
        
        $usuario = Usuario::create($data);
        return new UsuarioResource($usuario);
    }

    public function show(Usuario $usuario)
    {
        $this->authorize('view', $usuario);
        return new UsuarioResource($usuario->load('rol'));
    }

    public function update(UpdateUsuarioRequest $request, Usuario $usuario)
    {
        $this->authorize('update', $usuario);
        
        $data = $request->validated();
        if (isset($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        }
        
        $usuario->update($data);
        return new UsuarioResource($usuario);
    }

    public function destroy(Usuario $usuario)
    {
        $this->authorize('delete', $usuario);
        $usuario->delete(); // Soft delete
        return response()->noContent();
    }
}
