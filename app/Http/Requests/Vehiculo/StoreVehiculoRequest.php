<?php

namespace App\Http\Requests\Vehiculo;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreVehiculoRequest extends FormRequest
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
        return [
            'placa' => 'required|string|unique:vehiculos,placa',
            'marca' => 'required|string',
            'modelo' => 'required|string',
            'color' => 'required|string',
            'propietario_id' => 'required|exists:usuarios,id',
        ];
    }
}
