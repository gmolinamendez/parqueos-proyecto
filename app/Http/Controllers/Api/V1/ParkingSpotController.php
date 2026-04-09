<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\ParkingSpot\StoreParkingSpotRequest;
use App\Http\Requests\Api\V1\ParkingSpot\UpdateParkingSpotRequest;
use App\Http\Resources\Api\V1\ParkingSpotResource;
use App\Models\ParkingSpot;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class ParkingSpotController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', ParkingSpot::class);

        return response()->json([
            'status' => 'success',
            'message' => 'Parking spots retrieved successfully.',
            'data' => ParkingSpotResource::collection(ParkingSpot::query()->orderBy('code')->get()),
        ], Response::HTTP_OK);
    }

    public function store(StoreParkingSpotRequest $request): JsonResponse
    {
        $this->authorize('create', ParkingSpot::class);

        $spot = ParkingSpot::query()->create($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Parking spot created successfully.',
            'data' => new ParkingSpotResource($spot),
        ], Response::HTTP_CREATED);
    }

    public function show(ParkingSpot $parkingSpot): JsonResponse
    {
        $this->authorize('view', $parkingSpot);

        return response()->json([
            'status' => 'success',
            'message' => 'Parking spot retrieved successfully.',
            'data' => new ParkingSpotResource($parkingSpot),
        ], Response::HTTP_OK);
    }

    public function update(UpdateParkingSpotRequest $request, ParkingSpot $parkingSpot): JsonResponse
    {
        $this->authorize('update', $parkingSpot);

        $parkingSpot->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Parking spot updated successfully.',
            'data' => new ParkingSpotResource($parkingSpot->fresh()),
        ], Response::HTTP_OK);
    }

    public function destroy(ParkingSpot $parkingSpot): JsonResponse
    {
        $this->authorize('delete', $parkingSpot);

        $parkingSpot->delete();

        return response()->json(status: Response::HTTP_NO_CONTENT);
    }
}
