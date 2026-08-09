"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { Modal } from "@/components/Modal/Modal";
import { useUserTimeZone } from "@/hooks/useUserTimeZone";
import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getTimeZoneOffsetLabel,
  isOfficeTimeZone,
  OFFICE_TIME_ZONE,
} from "@/lib/date-time";
import { deleteBooking, updateBookingTitle } from "@/services/booking-service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeBookingDetailsModal } from "@/store/slices/schedule-slice";
import styles from "./BookingDetailsModal.module.css";

type ApiErrorResponse = {
  message?: string;
};

export function BookingDetailsModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const titleInputRef = useRef<HTMLInputElement>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");

  const userTimeZone = useUserTimeZone();

  const isOpen = useAppSelector(
    (state) => state.schedule.isBookingDetailsModalOpen,
  );

  const booking = useAppSelector((state) => state.schedule.selectedBooking);

  useEffect(() => {
    if (!isEditingTitle) {
      return;
    }

    titleInputRef.current?.focus();
    titleInputRef.current?.select();
  }, [isEditingTitle]);

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      toast.success("Booking cancelled successfully");

      resetEditingState();
      dispatch(closeBookingDetailsModal());
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data.message ?? "Failed to cancel booking";

      toast.error(message);
    },
  });

  const updateBookingTitleMutation = useMutation({
    mutationFn: updateBookingTitle,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      toast.success("Booking title updated successfully");

      resetEditingState();
      dispatch(closeBookingDetailsModal());
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data.message ?? "Failed to update booking title";

      toast.error(message);
    },
  });

  const isMutationPending =
    deleteBookingMutation.isPending || updateBookingTitleMutation.isPending;

  function resetEditingState() {
    setIsEditingTitle(false);
    setTitle("");
    setTitleError("");
  }

  function handleClose() {
    if (isMutationPending) {
      return;
    }

    resetEditingState();
    dispatch(closeBookingDetailsModal());
  }

  function handleStartEditing() {
    if (!booking) {
      return;
    }

    setTitle(booking.title);
    setTitleError("");
    setIsEditingTitle(true);
  }

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);

    if (titleError) {
      setTitleError("");
    }
  }

  function handleSaveTitle() {
    if (!booking || updateBookingTitleMutation.isPending) {
      return;
    }

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setTitleError("Title is required");
      titleInputRef.current?.focus();
      return;
    }

    if (normalizedTitle.length > 100) {
      setTitleError("Title must be 100 characters or fewer");
      titleInputRef.current?.focus();
      return;
    }

    if (normalizedTitle === booking.title) {
      setIsEditingTitle(false);
      setTitleError("");
      return;
    }

    updateBookingTitleMutation.mutate({
      bookingId: booking.id,
      title: normalizedTitle,
    });
  }

  function handleTitleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveTitle();
    }

    if (event.key === "Escape") {
      event.preventDefault();

      if (updateBookingTitleMutation.isPending) {
        return;
      }

      setIsEditingTitle(false);
      setTitleError("");
    }
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
      description="Review, edit or cancel your booking."
      size="wide"
      closeButtonLabel="Close booking details"
      closeDisabled={isMutationPending}
      onClose={handleClose}
    >
      <div className={styles.content}>
        <div className={styles.detail}>
          <label
            className={styles.detailLabel}
            htmlFor={isEditingTitle ? "booking-title" : undefined}
          >
            Title
          </label>

          {isEditingTitle ? (
            <>
              <input
                ref={titleInputRef}
                className={styles.titleInput}
                id="booking-title"
                name="title"
                type="text"
                value={title}
                maxLength={100}
                autoComplete="off"
                disabled={updateBookingTitleMutation.isPending}
                aria-invalid={Boolean(titleError)}
                aria-describedby={
                  titleError ? "booking-title-error" : undefined
                }
                onChange={(event) => handleTitleChange(event.target.value)}
                onKeyDown={handleTitleKeyDown}
              />

              {titleError && (
                <p className={styles.titleError} id="booking-title-error">
                  {titleError}
                </p>
              )}
            </>
          ) : (
            <strong className={styles.detailValue} title={booking.title}>
              {booking.title}
            </strong>
          )}
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
        {isEditingTitle ? (
          <button
            className={styles.saveButton}
            type="button"
            disabled={isMutationPending}
            onClick={handleSaveTitle}
          >
            {updateBookingTitleMutation.isPending ? "Saving..." : "Save title"}
          </button>
        ) : (
          <button
            className={styles.editButton}
            type="button"
            disabled={isMutationPending}
            onClick={handleStartEditing}
          >
            Edit title
          </button>
        )}

        <button
          className={styles.deleteButton}
          type="button"
          disabled={isMutationPending}
          onClick={() => handleDelete(booking.id, booking.title)}
        >
          {deleteBookingMutation.isPending ? "Cancelling..." : "Cancel booking"}
        </button>
      </footer>
    </Modal>
  );
}
