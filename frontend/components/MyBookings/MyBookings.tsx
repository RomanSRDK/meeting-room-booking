"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { compareAsc, compareDesc } from "date-fns";
import toast from "react-hot-toast";
import Link from "next/link";

import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getTimeZoneOffsetLabel,
  getUserTimeZone,
  isOfficeTimeZone,
  OFFICE_TIME_ZONE,
} from "@/lib/date-time";
import { myBookingsQueryOptions } from "@/queries/booking-queries";
import { deleteBooking } from "@/services/booking-service";

import styles from "./MyBookings.module.css";
import { BackButton } from "../BackButton/BackButton";

type ApiErrorResponse = {
  message?: string;
};

function subscribeToTimeZone() {
  return () => {};
}

function getScheduleUrl(roomId: string, startsAt: string): string {
  const searchParams = new URLSearchParams({
    roomId,
    date: startsAt,
  });

  return `/?${searchParams.toString()}`;
}

export function MyBookings() {
  const queryClient = useQueryClient();

  const userTimeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getUserTimeZone,
    () => OFFICE_TIME_ZONE,
  );

  const {
    data: bookings,
    isPending,
    isError,
  } = useQuery(myBookingsQueryOptions);

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      toast.success("Booking cancelled successfully");
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data.message ?? "Failed to cancel booking";

      toast.error(message);
    },
  });

  if (isPending) {
    return <p className={styles.state}>Loading bookings...</p>;
  }

  if (isError) {
    return <p className={styles.state}>Failed to load bookings</p>;
  }

  const now = new Date();

  const upcomingBookings = bookings
    .filter((booking) => new Date(booking.startsAt) > now)
    .sort((firstBooking, secondBooking) =>
      compareAsc(
        new Date(firstBooking.startsAt),
        new Date(secondBooking.startsAt),
      ),
    );

  const pastBookings = bookings
    .filter((booking) => new Date(booking.startsAt) <= now)
    .sort((firstBooking, secondBooking) =>
      compareDesc(
        new Date(firstBooking.startsAt),
        new Date(secondBooking.startsAt),
      ),
    );

  const userUsesOfficeTimeZone = isOfficeTimeZone(userTimeZone);

  const currentUserTimeZoneOffset = getTimeZoneOffsetLabel(userTimeZone, now);

  function handleCancelBooking(bookingId: string, bookingTitle: string) {
    const isConfirmed = window.confirm(`Cancel booking "${bookingTitle}"?`);

    if (!isConfirmed) {
      return;
    }

    deleteBookingMutation.mutate(bookingId);
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <BackButton />

          <div>
            <h1 className={styles.title}>My bookings</h1>

            <p className={styles.description}>
              Review your upcoming and previous room bookings.
            </p>

            <p className={styles.timeZoneNotice}>
              Times are shown in <strong>{userTimeZone}</strong> (
              {currentUserTimeZoneOffset}).
              {!userUsesOfficeTimeZone &&
                ` Office time is also displayed in ${OFFICE_TIME_ZONE}.`}
            </p>
          </div>
        </div>

        <div className={styles.counter}>
          <strong className={styles.counterValue}>
            {upcomingBookings.length}
          </strong>

          <span className={styles.counterLabel}>Upcoming</span>
        </div>
      </header>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming bookings</h2>

          <span className={styles.sectionCount}>{upcomingBookings.length}</span>
        </div>

        {upcomingBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No upcoming bookings</h3>

            <p className={styles.emptyDescription}>
              Your future room bookings will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {upcomingBookings.map((booking) => {
              const startsAt = new Date(booking.startsAt);

              const endsAt = new Date(booking.endsAt);

              const officeTimeZoneOffset = getTimeZoneOffsetLabel(
                OFFICE_TIME_ZONE,
                startsAt,
              );

              const isDeleting =
                deleteBookingMutation.isPending &&
                deleteBookingMutation.variables === booking.id;

              return (
                <article className={styles.card} key={booking.id}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.bookingTitle}>{booking.title}</h3>

                        <p className={styles.roomName}>{booking.room.name}</p>
                      </div>

                      <span className={styles.upcomingBadge}>Upcoming</span>
                    </div>

                    <dl className={styles.details}>
                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Your date</dt>

                        <dd className={styles.detailValue}>
                          {formatInUserTimeZone(
                            startsAt,
                            "dd.MM.yyyy",
                            userTimeZone,
                          )}
                        </dd>
                      </div>

                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Your time</dt>

                        <dd className={styles.detailValue}>
                          {formatInUserTimeZone(
                            startsAt,
                            "HH:mm",
                            userTimeZone,
                          )}
                          –{formatInUserTimeZone(endsAt, "HH:mm", userTimeZone)}
                        </dd>
                      </div>

                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Floor</dt>

                        <dd className={styles.detailValue}>
                          {booking.room.floor}
                        </dd>
                      </div>

                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Capacity</dt>

                        <dd className={styles.detailValue}>
                          {booking.room.capacity} people
                        </dd>
                      </div>
                    </dl>

                    {!userUsesOfficeTimeZone && (
                      <div className={styles.officeTime}>
                        <span className={styles.officeTimeLabel}>
                          Office time
                        </span>

                        <strong className={styles.officeTimeValue}>
                          {formatInOfficeTimeZone(
                            startsAt,
                            "dd.MM.yyyy, HH:mm",
                          )}
                          {" – "}
                          {formatInOfficeTimeZone(endsAt, "dd.MM.yyyy, HH:mm")}
                        </strong>

                        <span className={styles.officeTimeZone}>
                          {OFFICE_TIME_ZONE} ({officeTimeZoneOffset})
                        </span>
                      </div>
                    )}
                  </div>

                  <footer className={styles.cardFooter}>
                    <Link
                      className={styles.scheduleLink}
                      href={getScheduleUrl(booking.room.id, booking.startsAt)}
                    >
                      View in schedule
                    </Link>

                    <button
                      className={styles.cancelButton}
                      type="button"
                      disabled={deleteBookingMutation.isPending}
                      onClick={() =>
                        handleCancelBooking(booking.id, booking.title)
                      }
                    >
                      {isDeleting ? "Cancelling..." : "Cancel booking"}
                    </button>
                  </footer>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Previous bookings</h2>

          <span className={styles.sectionCount}>{pastBookings.length}</span>
        </div>

        {pastBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>No previous bookings</h3>

            <p className={styles.emptyDescription}>
              Completed bookings will appear here.
            </p>
          </div>
        ) : (
          <div className={styles.list}>
            {pastBookings.map((booking) => {
              const startsAt = new Date(booking.startsAt);

              const endsAt = new Date(booking.endsAt);

              const officeTimeZoneOffset = getTimeZoneOffsetLabel(
                OFFICE_TIME_ZONE,
                startsAt,
              );

              return (
                <article
                  className={`${styles.card} ${styles.pastCard}`}
                  key={booking.id}
                >
                  <div className={styles.cardContent}>
                    <div className={styles.cardHeader}>
                      <div>
                        <h3 className={styles.bookingTitle}>{booking.title}</h3>

                        <p className={styles.roomName}>{booking.room.name}</p>
                      </div>

                      <span className={styles.pastBadge}>Previous</span>
                    </div>

                    <dl className={styles.details}>
                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Your date</dt>

                        <dd className={styles.detailValue}>
                          {formatInUserTimeZone(
                            startsAt,
                            "dd.MM.yyyy",
                            userTimeZone,
                          )}
                        </dd>
                      </div>

                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Your time</dt>

                        <dd className={styles.detailValue}>
                          {formatInUserTimeZone(
                            startsAt,
                            "HH:mm",
                            userTimeZone,
                          )}
                          –{formatInUserTimeZone(endsAt, "HH:mm", userTimeZone)}
                        </dd>
                      </div>

                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Floor</dt>

                        <dd className={styles.detailValue}>
                          {booking.room.floor}
                        </dd>
                      </div>

                      <div className={styles.detail}>
                        <dt className={styles.detailLabel}>Capacity</dt>

                        <dd className={styles.detailValue}>
                          {booking.room.capacity} people
                        </dd>
                      </div>
                    </dl>

                    {!userUsesOfficeTimeZone && (
                      <div className={styles.officeTime}>
                        <span className={styles.officeTimeLabel}>
                          Office time
                        </span>

                        <strong className={styles.officeTimeValue}>
                          {formatInOfficeTimeZone(
                            startsAt,
                            "dd.MM.yyyy, HH:mm",
                          )}
                          {" – "}
                          {formatInOfficeTimeZone(endsAt, "dd.MM.yyyy, HH:mm")}
                        </strong>

                        <span className={styles.officeTimeZone}>
                          {OFFICE_TIME_ZONE} ({officeTimeZoneOffset})
                        </span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </section>
  );
}
