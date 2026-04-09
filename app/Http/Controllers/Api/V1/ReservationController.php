<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Reservation\StoreReservationRequest;
use App\Http\Resources\Api\V1\ReservationResource;
use App\Models\ParkingSpot;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class ReservationController extends Controller
{
    public function index(): JsonResponse
    {
        $this->authorize('viewAny', Reservation::class);

        $user = request()->user();

        $query = Reservation::query()
            ->with('parkingSpot')
            ->latest('start_at');

        if (! $user->hasRole('admin_parqueo')) {
            $query->where('user_id', $user->id);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Reservations retrieved successfully.',
            'data' => ReservationResource::collection($query->get()),
        ], Response::HTTP_OK);
    }

    public function store(StoreReservationRequest $request): JsonResponse
    {
        $this->authorize('create', Reservation::class);

        $user = $request->user();
        $payload = $request->validated();

        $reservation = DB::transaction(function () use ($payload, $user) {
            $spot = ParkingSpot::query()->lockForUpdate()->findOrFail($payload['parking_spot_id']);

            if (! $spot->is_active) {
                return null;
            }

            if ($spot->is_occupied) {
                return false;
            }

            $startAt = Carbon::parse($payload['start_at']);
            $endAt = Carbon::parse($payload['end_at']);

            $hasConflict = Reservation::query()
                ->where('parking_spot_id', $spot->id)
                ->where('status', Reservation::STATUS_ACTIVE)
                ->where(function ($query) use ($startAt, $endAt) {
                    $query
                        ->whereBetween('start_at', [$startAt, $endAt])
                        ->orWhereBetween('end_at', [$startAt, $endAt])
                        ->orWhere(function ($nestedQuery) use ($startAt, $endAt) {
                            $nestedQuery
                                ->where('start_at', '<', $startAt)
                                ->where('end_at', '>', $endAt);
                        });
                })
                ->exists();

            if ($hasConflict) {
                return true;
            }

            $reservation = Reservation::query()->create([
                'requester_name' => $payload['requester_name'],
                'user_id' => $user->id,
                'parking_spot_id' => $spot->id,
                'start_at' => $startAt,
                'end_at' => $endAt,
                'status' => Reservation::STATUS_ACTIVE,
            ]);

            if ($startAt->lessThanOrEqualTo(now()) && $endAt->greaterThan(now())) {
                $spot->update(['is_occupied' => true]);
            }

            return $reservation;
        });

        if ($reservation === null) {
            return response()->json([
                'status' => 'error',
                'message' => 'Only active parking spots can be reserved.',
                'errors' => [
                    'parking_spot_id' => ['The selected parking spot is inactive.'],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($reservation === false) {
            return response()->json([
                'status' => 'error',
                'message' => 'Parking spot is occupied.',
                'errors' => [
                    'parking_spot_id' => ['The selected parking spot is currently occupied.'],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if ($reservation === true) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reservation time conflicts with an active reservation.',
                'errors' => [
                    'time_conflict' => ['A reservation already exists for the selected range.'],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation created successfully.',
            'data' => new ReservationResource($reservation->load('parkingSpot')),
        ], Response::HTTP_CREATED);
    }

    public function cancel(Reservation $reservation): JsonResponse
    {
        $this->authorize('cancel', $reservation);

        if (! $reservation->canBeCancelled()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Reservation cannot be cancelled.',
                'errors' => [
                    'status' => ['Only active reservations can be cancelled.'],
                ],
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        DB::transaction(function () use ($reservation) {
            $reservation->update([
                'status' => Reservation::STATUS_CANCELLED,
                'cancelled_at' => now(),
            ]);

            $reservation->parkingSpot()->update(['is_occupied' => false]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Reservation cancelled successfully.',
            'data' => new ReservationResource($reservation->fresh()->load('parkingSpot')),
        ], Response::HTTP_OK);
    }
}
