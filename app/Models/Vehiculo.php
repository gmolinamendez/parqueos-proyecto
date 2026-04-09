<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Vehiculo extends Model
{
    use SoftDeletes;
    
    protected $table = 'vehiculos';
    protected $fillable = ['placa', 'marca', 'modelo', 'color', 'propietario_id'];

    public function propietario()
    {
        return $this->belongsTo(Usuario::class, 'propietario_id');
    }

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class);
    }
}
