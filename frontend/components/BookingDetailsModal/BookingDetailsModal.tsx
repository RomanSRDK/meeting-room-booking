"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

import { Modal } from "@/components/Modal/Modal";
import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getTimeZoneOffsetLabel,
  getUserTimeZone,
  isOfficeTimeZone,
  OFFICE_TIME_ZONE,
} from "@/lib/date-time";
import { deleteBooking } from "@/services/booking-service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeBookingDetailsModal } from "@/store/slices/schedule-slice";

import styles from "./BookingDetailsModal.module.css";

type ApiErrorResponse = {
  message?: string;
};

function subscribeToTimeZone() {
  return () => {};
}

export function BookingDetailsModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const userTimeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getUserTimeZone,
    () => OFFICE_TIME_ZONE,
  );

  const isOpen = useAppSelector(
    (state) => state.schedule.isBookingDetailsModalOpen,
  );

  const booking = useAppSelector((state) => state.schedule.selectedBooking);

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      toast.success("Booking cancelled successfully");

      dispatch(closeBookingDetailsModal());
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data.message ?? "Failed to cancel booking";

      toast.error(message);
    },
  });

  function handleClose() {
    if (deleteBookingMutation.isPending) {
      return;
    }

    dispatch(closeBookingDetailsModal());
  }

  function handleDelete(bookingId: string, bookingTitle: string) {
    const isConfirmed = window.confirm(`Cancel booking "${bookingTitle}"?`);

    if (!isConfirmed) {
      return;
    }

    deleteBookingMutation.mutate(bookingId);
  }

  if (!isOpen || !booking) {
    return null;
  }

  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  const userUsesOfficeTimeZone = isOfficeTimeZone(userTimeZone);

  const userTimeZoneOffset = getTimeZoneOffsetLabel(userTimeZone, startsAt);

  const officeTimeZoneOffset = getTimeZoneOffsetLabel(
    OFFICE_TIME_ZONE,
    startsAt,
  );

  return (
    <Modal
      title="Booking details"
      description="Review or cancel your booking."
      size="wide"
      closeButtonLabel="Close booking details"
      closeDisabled={deleteBookingMutation.isPending}
      onClose={handleClose}
    >
      <div className={styles.content}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Title</span>

          <strong className={styles.detailValue} title={booking.title}>
            {booking.title}
          </strong>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Your date</span>

            <strong className={styles.detailValue}>
              {formatInUserTimeZone(startsAt, "dd.MM.yyyy", userTimeZone)}
            </strong>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>Your time</span>

            <strong className={styles.detailValue}>
              {formatInUserTimeZone(startsAt, "HH:mm", userTimeZone)}–
              {formatInUserTimeZone(endsAt, "HH:mm", userTimeZone)}
            </strong>
          </div>
        </div>

        {!userUsesOfficeTimeZone && (
          <div className={styles.officeTime}>
            <span className={styles.officeTimeLabel}>Office time</span>

            <strong className={styles.officeTimeValue}>
              {formatInOfficeTimeZone(startsAt, "dd.MM.yyyy, HH:mm")}
              {" – "}
              {formatInOfficeTimeZone(endsAt, "dd.MM.yyyy, HH:mm")}
            </strong>

            <span className={styles.officeTimeZone}>
              {OFFICE_TIME_ZONE} ({officeTimeZoneOffset})
            </span>
          </div>
        )}

        <p className={styles.timeZoneHint}>
          Times are shown in {userTimeZone} ({userTimeZoneOffset}).
        </p>
      </div>

      <footer className={styles.footer}>
        <button
          className={styles.closeAction}
          type="button"
          disabled={deleteBookingMutation.isPending}
          onClick={handleClose}
        >
          Close
        </button>

        <button
          className={styles.deleteButton}
          type="button"
          disabled={deleteBookingMutation.isPending}
          onClick={() => handleDelete(booking.id, booking.title)}
        >
          {deleteBookingMutation.isPending ? "Cancelling..." : "Cancel booking"}
        </button>
      </footer>
    </Modal>
  );
}
