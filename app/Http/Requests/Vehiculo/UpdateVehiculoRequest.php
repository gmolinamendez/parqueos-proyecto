<?php

namespace App\Http\Requests\Vehiculo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateVehiculoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // Safe resolution for route model binding
        $vehiculo = $this->route('vehiculo');
        $id = is_object($vehiculo) ? $vehiculo->id : $vehiculo;
        return [
            'placa' => 'sometimes|required|string|unique:vehiculos,placa,' . $id,
            'marca' => 'sometimes|required|string',
            'modelo' => 'sometimes|required|string',
            'color' => 'sometimes|required|string',
            'propietario_id' => 'sometimes|required|exists:usuarios,id',
        ];
    }
}
