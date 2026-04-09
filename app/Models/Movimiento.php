<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Movimiento extends Model
{
    protected $table = 'movimientos';
    protected $fillable = ['vehiculo_id', 'parqueo_id', 'fecha_entrada', 'fecha_salida'];

    public function vehiculo()
    {
        return $this->belongsTo(Vehiculo::class);
    }

    public function parqueo()
    {
        return $this->belongsTo(Parqueo::class);
    }

    public function scopeActivos($query)
    {
        return $query->whereNull('fecha_salida');
    }
}
