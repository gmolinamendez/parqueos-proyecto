import type {
    ApiEnvelope,
    ApiErrors,
    ApiUserProfile,
    AuthLoginPayload,
    AuthLoginResponse,
    ParkingSpot,
    ParkingSpotPayload,
    Reservation,
    ReservationPayload,
} from '@/types/parking';

const API_BASE = '/api/v1';

export class ParkingApiError extends Error {
    status: number;
    errors?: ApiErrors;

    constructor(message: string, status: number, errors?: ApiErrors) {
        super(message);
        this.name = 'ParkingApiError';
        this.status = status;
        this.errors = errors;
    }
}

async function request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string,
): Promise<T> {
    const headers = new Headers(options.headers ?? {});
    headers.set('Accept', 'application/json');

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 204) {
        return undefined as T;
    }

    const payload = (await response.json()) as ApiEnvelope<T>;

    if (!response.ok) {
        throw new ParkingApiError(
            payload.message || 'Request failed.',
            response.status,
            payload.errors,
        );
    }

    return payload.data as T;
}

export const parkingApi = {
    login(payload: AuthLoginPayload): Promise<AuthLoginResponse> {
        return request<AuthLoginResponse>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    },

    profile(token: string): Promise<ApiUserProfile> {
        return request<ApiUserProfile>('/auth/profile', { method: 'GET' }, token);
    },

    logout(token: string): Promise<undefined> {
        return request<undefined>('/auth/logout', { method: 'POST' }, token);
    },

    listParkingSpots(token: string): Promise<ParkingSpot[]> {
        return request<ParkingSpot[]>('/parking-spots', { method: 'GET' }, token);
    },

    createParkingSpot(token: string, payload: ParkingSpotPayload): Promise<ParkingSpot> {
        return request<ParkingSpot>(
            '/parking-spots',
            { method: 'POST', body: JSON.stringify(payload) },
            token,
        );
    },

    updateParkingSpot(
        token: string,
        spotId: number,
        payload: ParkingSpotPayload,
    ): Promise<ParkingSpot> {
        return request<ParkingSpot>(
            `/parking-spots/${spotId}`,
            { method: 'PUT', body: JSON.stringify(payload) },
            token,
        );
    },

    deleteParkingSpot(token: string, spotId: number): Promise<undefined> {
        return request<undefined>(`/parking-spots/${spotId}`, { method: 'DELETE' }, token);
    },

    listReservations(token: string): Promise<Reservation[]> {
        return request<Reservation[]>('/reservations', { method: 'GET' }, token);
    },

    createReservation(token: string, payload: ReservationPayload): Promise<Reservation> {
        return request<Reservation>(
            '/reservations',
            { method: 'POST', body: JSON.stringify(payload) },
            token,
        );
    },

    cancelReservation(token: string, reservationId: number): Promise<Reservation> {
        return request<Reservation>(
            `/reservations/${reservationId}/cancel`,
            { method: 'POST' },
            token,
        );
    },
};
