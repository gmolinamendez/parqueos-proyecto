import { Head } from '@inertiajs/react';
import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { parkingApi, ParkingApiError } from '@/lib/parking-api';
import type {
    ApiErrors,
    ApiUserProfile,
    ParkingSpot,
    ParkingSpotPayload,
    Reservation,
    ReservationPayload,
} from '@/types/parking';

const TOKEN_KEY = 'parking_api_token';

type SpotFormState = {
    id: number | null;
    code: string;
    zone: string;
    is_active: boolean;
    is_occupied: boolean;
};

type ReservationFormState = {
    requester_name: string;
    parking_spot_id: number;
    start_at: string;
    end_at: string;
};

const emptySpotForm: SpotFormState = {
    id: null,
    code: '',
    zone: '',
    is_active: true,
    is_occupied: false,
};

function formatApiErrors(errors?: ApiErrors): string {
    if (!errors) {
        return 'Please review your request and try again.';
    }

    return Object.entries(errors)
        .map(([field, fieldErrors]) => `${field}: ${fieldErrors.join(', ')}`)
        .join(' | ');
}

function toApiDateTime(localDateTime: string): string {
    if (!localDateTime) {
        return localDateTime;
    }

    return `${localDateTime.replace('T', ' ')}:00`;
}

function toLocalDateTime(apiDateTime: string): string {
    const normalized = apiDateTime.replace(' ', 'T');

    return normalized.slice(0, 16);
}

function statusVariant(status: Reservation['status']): 'default' | 'secondary' | 'destructive' {
    if (status === 'active') {
        return 'default';
    }

    if (status === 'cancelled') {
        return 'destructive';
    }

    return 'secondary';
}

export default function ParkingOperationsPage() {
    const [token, setToken] = useState<string | null>(null);
    const [profile, setProfile] = useState<ApiUserProfile | null>(null);
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);

    const [authLoading, setAuthLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [loginEmail, setLoginEmail] = useState('admin.parqueo@example.com');
    const [loginPassword, setLoginPassword] = useState('password');

    const [spotForm, setSpotForm] = useState<SpotFormState>(emptySpotForm);
    const [reservationForm, setReservationForm] = useState<ReservationFormState>({
        requester_name: '',
        parking_spot_id: 0,
        start_at: '',
        end_at: '',
    });

    const isAdmin = useMemo(
        () => Boolean(profile?.roles.includes('admin_parqueo')),
        [profile],
    );

    const activeSpots = useMemo(() => spots.filter((spot) => spot.is_active), [spots]);

    async function loadCoreData(activeToken: string): Promise<void> {
        setDataLoading(true);

        try {
            const [nextProfile, nextSpots, nextReservations] = await Promise.all([
                parkingApi.profile(activeToken),
                parkingApi.listParkingSpots(activeToken),
                parkingApi.listReservations(activeToken),
            ]);

            setProfile(nextProfile);
            setSpots(nextSpots);
            setReservations(nextReservations);

            if (!reservationForm.parking_spot_id && nextSpots.length > 0) {
                setReservationForm((current) => ({
                    ...current,
                    parking_spot_id: nextSpots[0]?.id ?? 0,
                }));
            }
        } catch (error) {
            if (error instanceof ParkingApiError && error.status === 401) {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
                setProfile(null);
                toast.error('Session expired. Please login again.');
                return;
            }

            toast.error(error instanceof Error ? error.message : 'Failed to load data.');
        } finally {
            setDataLoading(false);
        }
    }

    useEffect(() => {
        const savedToken = localStorage.getItem(TOKEN_KEY);

        if (savedToken) {
            setToken(savedToken);
            void loadCoreData(savedToken);
        }
    }, []);

    async function handleApiLogin(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();
        setAuthLoading(true);

        try {
            const loginResult = await parkingApi.login({
                email: loginEmail,
                password: loginPassword,
                device_name: 'parking-frontend',
            });

            localStorage.setItem(TOKEN_KEY, loginResult.token);
            setToken(loginResult.token);
            toast.success('API session started.');
            await loadCoreData(loginResult.token);
        } catch (error) {
            const fallback = 'Unable to login to API.';

            if (error instanceof ParkingApiError) {
                toast.error(`${error.message} ${formatApiErrors(error.errors)}`);
            } else {
                toast.error(fallback);
            }
        } finally {
            setAuthLoading(false);
        }
    }

    async function handleApiLogout(): Promise<void> {
        if (!token) {
            return;
        }

        setAuthLoading(true);

        try {
            await parkingApi.logout(token);
        } catch {
            // The token might already be invalidated; we still clear local state.
        } finally {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
            setProfile(null);
            setSpots([]);
            setReservations([]);
            setAuthLoading(false);
            toast.success('API session closed.');
        }
    }

    async function refreshData(): Promise<void> {
        if (!token) {
            return;
        }

        await loadCoreData(token);
    }

    async function handleSpotSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!token) {
            return;
        }

        const payload: ParkingSpotPayload = {
            code: spotForm.code,
            zone: spotForm.zone,
            is_active: spotForm.is_active,
            is_occupied: spotForm.is_occupied,
        };

        setSubmitting(true);

        try {
            if (spotForm.id) {
                await parkingApi.updateParkingSpot(token, spotForm.id, payload);
                toast.success('Parking spot updated.');
            } else {
                await parkingApi.createParkingSpot(token, payload);
                toast.success('Parking spot created.');
            }

            setSpotForm(emptySpotForm);
            await refreshData();
        } catch (error) {
            if (error instanceof ParkingApiError) {
                toast.error(`${error.message} ${formatApiErrors(error.errors)}`);
            } else {
                toast.error('Unable to save parking spot.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    function beginEditSpot(spot: ParkingSpot): void {
        setSpotForm({
            id: spot.id,
            code: spot.code,
            zone: spot.zone,
            is_active: spot.is_active,
            is_occupied: spot.is_occupied,
        });
    }

    async function removeSpot(spotId: number): Promise<void> {
        if (!token) {
            return;
        }

        const confirmed = window.confirm('Delete this parking spot?');

        if (!confirmed) {
            return;
        }

        setSubmitting(true);

        try {
            await parkingApi.deleteParkingSpot(token, spotId);
            toast.success('Parking spot deleted.');

            if (spotForm.id === spotId) {
                setSpotForm(emptySpotForm);
            }

            await refreshData();
        } catch (error) {
            if (error instanceof ParkingApiError) {
                toast.error(`${error.message} ${formatApiErrors(error.errors)}`);
            } else {
                toast.error('Unable to delete parking spot.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function handleReservationSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        if (!token) {
            return;
        }

        if (!reservationForm.parking_spot_id) {
            toast.error('Select a parking spot before creating a reservation.');
            return;
        }

        const payload: ReservationPayload = {
            requester_name: reservationForm.requester_name,
            parking_spot_id: reservationForm.parking_spot_id,
            start_at: toApiDateTime(reservationForm.start_at),
            end_at: toApiDateTime(reservationForm.end_at),
        };

        setSubmitting(true);

        try {
            await parkingApi.createReservation(token, payload);
            toast.success('Reservation created.');
            setReservationForm((current) => ({
                ...current,
                requester_name: '',
                start_at: '',
                end_at: '',
            }));
            await refreshData();
        } catch (error) {
            if (error instanceof ParkingApiError) {
                toast.error(`${error.message} ${formatApiErrors(error.errors)}`);
            } else {
                toast.error('Unable to create reservation.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    async function cancelReservation(reservationId: number): Promise<void> {
        if (!token) {
            return;
        }

        setSubmitting(true);

        try {
            await parkingApi.cancelReservation(token, reservationId);
            toast.success('Reservation cancelled.');
            await refreshData();
        } catch (error) {
            if (error instanceof ParkingApiError) {
                toast.error(`${error.message} ${formatApiErrors(error.errors)}`);
            } else {
                toast.error('Unable to cancel reservation.');
            }
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            <Head title="Parking Operations" />

            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl bg-[linear-gradient(120deg,rgba(15,23,42,0.03),rgba(14,116,144,0.06),rgba(16,185,129,0.06))] p-4 md:p-6">
                <section className="grid gap-4 md:grid-cols-4">
                    <Card className="border-sky-200/60 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardDescription>Parking Spots</CardDescription>
                            <CardTitle className="text-3xl">{spots.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-emerald-200/70 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardDescription>Active Spots</CardDescription>
                            <CardTitle className="text-3xl">{activeSpots.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-orange-200/70 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardDescription>Reservations</CardDescription>
                            <CardTitle className="text-3xl">{reservations.length}</CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-indigo-200/70 bg-white/80 backdrop-blur">
                        <CardHeader className="pb-2">
                            <CardDescription>Role</CardDescription>
                            <CardTitle className="text-xl">
                                {profile?.roles.join(', ') || 'Not connected'}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <Card className="bg-white/90 shadow-sm backdrop-blur">
                    <CardHeader>
                        <CardTitle>API Session</CardTitle>
                        <CardDescription>
                            Authenticate against /api/v1/auth endpoints to use reservation operations.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!token ? (
                            <form className="grid gap-4 md:grid-cols-4" onSubmit={handleApiLogin}>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="api-email">Email</Label>
                                    <Input
                                        id="api-email"
                                        type="email"
                                        value={loginEmail}
                                        onChange={(event) => setLoginEmail(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="api-password">Password</Label>
                                    <Input
                                        id="api-password"
                                        type="password"
                                        value={loginPassword}
                                        onChange={(event) => setLoginPassword(event.target.value)}
                                        required
                                    />
                                </div>
                                <div className="flex items-end">
                                    <Button className="w-full" type="submit" disabled={authLoading}>
                                        {authLoading ? 'Connecting...' : 'Connect API'}
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50/70 p-3">
                                <div>
                                    <p className="text-sm font-medium text-emerald-800">
                                        Connected as {profile?.name || 'User'}
                                    </p>
                                    <p className="text-sm text-emerald-700">{profile?.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => void refreshData()} disabled={dataLoading}>
                                        Refresh
                                    </Button>
                                    <Button variant="destructive" onClick={() => void handleApiLogout()} disabled={authLoading}>
                                        Logout API
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {token ? (
                    <>
                        <section className="grid gap-6 lg:grid-cols-5">
                            <Card className="bg-white/95 lg:col-span-2">
                                <CardHeader>
                                    <CardTitle>Create Reservation</CardTitle>
                                    <CardDescription>
                                        Reserve an active parking spot. Conflicts and occupancy are validated by API.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-4" onSubmit={handleReservationSubmit}>
                                        <div className="space-y-2">
                                            <Label htmlFor="requester_name">Requester name</Label>
                                            <Input
                                                id="requester_name"
                                                value={reservationForm.requester_name}
                                                onChange={(event) =>
                                                    setReservationForm((current) => ({
                                                        ...current,
                                                        requester_name: event.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="spot_select">Parking spot</Label>
                                            <select
                                                id="spot_select"
                                                className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                                                value={reservationForm.parking_spot_id}
                                                onChange={(event) =>
                                                    setReservationForm((current) => ({
                                                        ...current,
                                                        parking_spot_id: Number(event.target.value),
                                                    }))
                                                }
                                            >
                                                <option value={0}>Select a spot</option>
                                                {activeSpots.map((spot) => (
                                                    <option key={spot.id} value={spot.id}>
                                                        {spot.code} · Zone {spot.zone}{spot.is_occupied ? ' · Occupied' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="start_at">Start</Label>
                                                <Input
                                                    id="start_at"
                                                    type="datetime-local"
                                                    value={reservationForm.start_at}
                                                    onChange={(event) =>
                                                        setReservationForm((current) => ({
                                                            ...current,
                                                            start_at: event.target.value,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="end_at">End</Label>
                                                <Input
                                                    id="end_at"
                                                    type="datetime-local"
                                                    value={reservationForm.end_at}
                                                    onChange={(event) =>
                                                        setReservationForm((current) => ({
                                                            ...current,
                                                            end_at: event.target.value,
                                                        }))
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <Button type="submit" disabled={submitting}>
                                            {submitting ? 'Submitting...' : 'Create reservation'}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="bg-white/95 lg:col-span-3">
                                <CardHeader>
                                    <CardTitle>Reservations</CardTitle>
                                    <CardDescription>
                                        Admin sees all reservations. Docente and estudiante see their own history.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="border-b text-left text-muted-foreground">
                                                    <th className="py-2 pr-4">Requester</th>
                                                    <th className="py-2 pr-4">Spot</th>
                                                    <th className="py-2 pr-4">Window</th>
                                                    <th className="py-2 pr-4">Status</th>
                                                    <th className="py-2 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {reservations.map((reservation) => (
                                                    <tr key={reservation.id} className="border-b/70 align-top">
                                                        <td className="py-3 pr-4">{reservation.requester_name}</td>
                                                        <td className="py-3 pr-4">
                                                            {reservation.spot_code || reservation.parking_spot_id}
                                                        </td>
                                                        <td className="py-3 pr-4 text-muted-foreground">
                                                            <p>{toLocalDateTime(reservation.start_at)}</p>
                                                            <p>{toLocalDateTime(reservation.end_at)}</p>
                                                        </td>
                                                        <td className="py-3 pr-4">
                                                            <Badge variant={statusVariant(reservation.status)}>
                                                                {reservation.status}
                                                            </Badge>
                                                        </td>
                                                        <td className="py-3 text-right">
                                                            {reservation.status === 'active' ? (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() =>
                                                                        void cancelReservation(reservation.id)
                                                                    }
                                                                    disabled={submitting}
                                                                >
                                                                    Cancel
                                                                </Button>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Not available
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {reservations.length === 0 ? (
                                        <p className="mt-4 text-sm text-muted-foreground">
                                            No reservations found for this account.
                                        </p>
                                    ) : null}
                                </CardContent>
                            </Card>
                        </section>

                        <Card className="bg-white/95">
                            <CardHeader>
                                <CardTitle>Parking Spots</CardTitle>
                                <CardDescription>
                                    {isAdmin
                                        ? 'You can create, update and delete parking spots as admin_parqueo.'
                                        : 'Read-only view for your role.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {isAdmin ? (
                                    <form
                                        className="mb-6 grid gap-4 rounded-xl border bg-slate-50/70 p-4 md:grid-cols-6"
                                        onSubmit={handleSpotSubmit}
                                    >
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="spot-code">Code</Label>
                                            <Input
                                                id="spot-code"
                                                value={spotForm.code}
                                                onChange={(event) =>
                                                    setSpotForm((current) => ({
                                                        ...current,
                                                        code: event.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="spot-zone">Zone</Label>
                                            <Input
                                                id="spot-zone"
                                                value={spotForm.zone}
                                                onChange={(event) =>
                                                    setSpotForm((current) => ({
                                                        ...current,
                                                        zone: event.target.value,
                                                    }))
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="spot-active">Active</Label>
                                            <select
                                                id="spot-active"
                                                className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                                                value={spotForm.is_active ? 'true' : 'false'}
                                                onChange={(event) =>
                                                    setSpotForm((current) => ({
                                                        ...current,
                                                        is_active: event.target.value === 'true',
                                                    }))
                                                }
                                            >
                                                <option value="true">Active</option>
                                                <option value="false">Inactive</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="spot-occupied">Occupied</Label>
                                            <select
                                                id="spot-occupied"
                                                className="border-input bg-background focus-visible:ring-ring/50 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-[3px]"
                                                value={spotForm.is_occupied ? 'true' : 'false'}
                                                onChange={(event) =>
                                                    setSpotForm((current) => ({
                                                        ...current,
                                                        is_occupied: event.target.value === 'true',
                                                    }))
                                                }
                                            >
                                                <option value="false">Free</option>
                                                <option value="true">Occupied</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-6 flex flex-wrap gap-2">
                                            <Button type="submit" disabled={submitting}>
                                                {spotForm.id ? 'Update spot' : 'Create spot'}
                                            </Button>
                                            {spotForm.id ? (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setSpotForm(emptySpotForm)}
                                                >
                                                    Reset form
                                                </Button>
                                            ) : null}
                                        </div>
                                    </form>
                                ) : null}

                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b text-left text-muted-foreground">
                                                <th className="py-2 pr-4">Code</th>
                                                <th className="py-2 pr-4">Zone</th>
                                                <th className="py-2 pr-4">Active</th>
                                                <th className="py-2 pr-4">Occupied</th>
                                                {isAdmin ? <th className="py-2 text-right">Actions</th> : null}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {spots.map((spot) => (
                                                <tr key={spot.id} className="border-b/70 align-top">
                                                    <td className="py-3 pr-4 font-medium">{spot.code}</td>
                                                    <td className="py-3 pr-4">{spot.zone}</td>
                                                    <td className="py-3 pr-4">
                                                        <Badge variant={spot.is_active ? 'default' : 'secondary'}>
                                                            {spot.is_active ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <Badge
                                                            variant={
                                                                spot.is_occupied
                                                                    ? 'destructive'
                                                                    : 'secondary'
                                                            }
                                                        >
                                                            {spot.is_occupied ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </td>
                                                    {isAdmin ? (
                                                        <td className="py-3 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => beginEditSpot(spot)}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    onClick={() => void removeSpot(spot.id)}
                                                                    disabled={submitting}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    ) : null}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <p className="text-xs text-muted-foreground">
                                    HTTP flows implemented: 200, 201, 204, 401, 403, 422.
                                </p>
                            </CardFooter>
                        </Card>
                    </>
                ) : (
                    <Card className="bg-white/95">
                        <CardHeader>
                            <CardTitle>Connect to start</CardTitle>
                            <CardDescription>
                                Login with an API account to load spots and reservations.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}

                {dataLoading ? (
                    <p className="text-sm text-muted-foreground">Syncing data from API...</p>
                ) : null}
            </div>
        </>
    );
}

ParkingOperationsPage.layout = {
    breadcrumbs: [
        {
            title: 'Parking Operations',
            href: '/parking',
        },
    ],
};
