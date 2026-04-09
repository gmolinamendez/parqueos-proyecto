export type ApiErrors = Record<string, string[]>;

export type ApiEnvelope<T> = {
    status: string;
    message: string;
    data?: T;
    errors?: ApiErrors;
};

export type ApiUserProfile = {
    id: number;
    name: string;
    email: string;
    roles: string[];
};

export type AuthLoginPayload = {
    email: string;
    password: string;
    device_name?: string;
};

export type AuthLoginResponse = {
    token: string;
    token_type: string;
    user: ApiUserProfile;
};

export type ParkingSpot = {
    id: number;
    code: string;
    zone: string;
    is_active: boolean;
    is_occupied: boolean;
    created_at: string;
    updated_at: string;
};

export type ReservationStatus = 'active' | 'cancelled' | 'completed';

export type Reservation = {
    id: number;
    requester_name: string;
    user_id: number;
    parking_spot_id: number;
    spot_code?: string | null;
    start_at: string;
    end_at: string;
    status: ReservationStatus;
    cancelled_at?: string | null;
    created_at: string;
    updated_at: string;
};

export type ParkingSpotPayload = {
    code: string;
    zone: string;
    is_active: boolean;
    is_occupied: boolean;
};

export type ReservationPayload = {
    requester_name: string;
    parking_spot_id: number;
    start_at: string;
    end_at: string;
};
