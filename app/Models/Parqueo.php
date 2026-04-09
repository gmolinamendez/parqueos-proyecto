<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\SoftDeletes;

class Parqueo extends Model
{
    use SoftDeletes;
    
    protected $table = 'parqueos';
    protected $fillable = ['nombre', 'ubicacion', 'cupos_maximos'];
    
    protected $appends = ['cupos_disponibles'];

    public function movimientos()
    {
        return $this->hasMany(Movimiento::class);
    }

    public function getCuposDisponiblesAttribute()
    {
        $ocupados = $this->movimientos()->activos()->count();
        return max(0, $this->cupos_maximos - $ocupados);
    }
}
