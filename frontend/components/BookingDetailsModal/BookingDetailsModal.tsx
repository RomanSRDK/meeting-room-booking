"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { IoClose } from "react-icons/io5";
import { deleteBooking } from "@/services/booking-service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeBookingDetailsModal } from "@/store/slices/schedule-slice";

import styles from "./BookingDetailsModal.module.css";

type ApiErrorResponse = {
  message?: string;
};

export function BookingDetailsModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

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

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    handleClose();
  }

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (deleteBookingMutation.isPending) {
        return;
      }

      dispatch(closeBookingDetailsModal());
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, isOpen, deleteBookingMutation.isPending]);

  if (!isOpen || !booking) {
    return null;
  }

  const startsAt = new Date(booking.startsAt);
  const endsAt = new Date(booking.endsAt);

  function handleDelete(bookingId: string) {
    deleteBookingMutation.mutate(bookingId);
  }

  return createPortal(
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-details-title"
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title} id="booking-details-title">
              Booking details
            </h2>

            <p className={styles.description}>Review or cancel your booking.</p>
          </div>

          <button
            className={styles.closeButton}
            type="button"
            aria-label="Close booking details"
            disabled={deleteBookingMutation.isPending}
            onClick={handleClose}
          >
            <IoClose />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Title</span>

            <strong className={styles.detailValue}>{booking.title}</strong>
          </div>

          <div className={styles.detailsGrid}>
            <div className={styles.detail}>
              <span className={styles.detailLabel}>Date</span>

              <strong className={styles.detailValue}>
                {format(startsAt, "dd.MM.yyyy")}
              </strong>
            </div>

            <div className={styles.detail}>
              <span className={styles.detailLabel}>Time</span>

              <strong className={styles.detailValue}>
                {format(startsAt, "HH:mm")}–{format(endsAt, "HH:mm")}
              </strong>
            </div>
          </div>
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
            onClick={() => handleDelete(booking.id)}
          >
            {deleteBookingMutation.isPending
              ? "Cancelling..."
              : "Cancel booking"}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
}
