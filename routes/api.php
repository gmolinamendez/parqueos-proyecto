<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UsuarioController;
use App\Http\Controllers\Api\VehiculoController;
use App\Http\Controllers\Api\ParqueoController;
use App\Http\Controllers\Api\MovimientoController;

Route::post('/auth/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('usuarios', UsuarioController::class);
    
    Route::apiResource('vehiculos', VehiculoController::class);
    
    Route::get('parqueos/{parqueo}/disponibilidad', [ParqueoController::class, 'disponibilidad']);
    Route::apiResource('parqueos', ParqueoController::class);
    
    Route::prefix('movimientos')->group(function () {
        Route::post('entrada', [MovimientoController::class, 'entrada']);
        Route::post('salida', [MovimientoController::class, 'salida']);
        Route::get('activos', [MovimientoController::class, 'activos']);
        Route::get('historial', [MovimientoController::class, 'historial']);
    });
});
