<?php

use App\Models\Reservation;

test('reservation activa y cancelada se evaluan correctamente', function () {
    $active = new Reservation(['status' => Reservation::STATUS_ACTIVE]);
    $cancelled = new Reservation(['status' => Reservation::STATUS_CANCELLED]);

    expect($active->isActive())->toBeTrue();
    expect($active->isCancelled())->toBeFalse();
    expect($active->canBeCancelled())->toBeTrue();

    expect($cancelled->isActive())->toBeFalse();
    expect($cancelled->isCancelled())->toBeTrue();
    expect($cancelled->canBeCancelled())->toBeFalse();
});

test('accessor de timestamps en reservation es datetime', function () {
    $reservation = new Reservation([
        'start_at' => '2026-04-08 10:00:00',
        'end_at' => '2026-04-08 12:00:00',
    ]);

    expect($reservation->start_at)->toBeInstanceOf(\DateTimeInterface::class);
    expect($reservation->end_at)->toBeInstanceOf(\DateTimeInterface::class);
});
