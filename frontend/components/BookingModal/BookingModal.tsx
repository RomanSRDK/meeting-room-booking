"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import {
  addMinutes,
  format,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
} from "date-fns";
import { IoClose } from "react-icons/io5";
import { Form, Formik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";

import { createBooking } from "@/services/booking-service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeBookingModal } from "@/store/slices/schedule-slice";
import type { Booking } from "@/types/booking";

import styles from "./BookingModal.module.css";

const WORKING_DAY_END_HOUR = 19;

const BOOKING_DURATIONS = [30, 60, 90, 120, 150, 180, 210, 240];

type BookingFormValues = {
  title: string;
  duration: number;
};

type ApiErrorResponse = {
  message?: string;
};

function formatDuration(duration: number) {
  const hours = Math.floor(duration / 60);
  const minutes = duration % 60;

  if (hours === 0) {
    return `${minutes} minutes`;
  }

  if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${hours} ${hours === 1 ? "hour" : "hours"} ${minutes} minutes`;
}

export function BookingModal() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const isBookingModalOpen = useAppSelector(
    (state) => state.schedule.isBookingModalOpen,
  );

  const bookingDraft = useAppSelector((state) => state.schedule.bookingDraft);

  const createBookingMutation = useMutation({
    mutationFn: createBooking,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      toast.success("Booking created successfully");

      dispatch(closeBookingModal());
    },

    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message =
        error.response?.data.message ?? "Failed to create booking";

      toast.error(message);
    },
  });

  function handleClose() {
    if (createBookingMutation.isPending) {
      return;
    }

    dispatch(closeBookingModal());
  }

  function handleBackdropClick(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) {
      return;
    }

    handleClose();
  }

  useEffect(() => {
    if (!isBookingModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") {
        return;
      }

      if (createBookingMutation.isPending) {
        return;
      }

      dispatch(closeBookingModal());
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, isBookingModalOpen, createBookingMutation.isPending]);

  if (!isBookingModalOpen || !bookingDraft) {
    return null;
  }

  const startsAt = new Date(bookingDraft.startsAt);

  const workingDayEnd = setMilliseconds(
    setSeconds(setMinutes(setHours(startsAt, WORKING_DAY_END_HOUR), 0), 0),
    0,
  );

  const cachedBookingQueries = queryClient.getQueriesData<Booking[]>({
    queryKey: ["bookings"],
  });

  const cachedBookings = cachedBookingQueries.flatMap(
    ([, bookings]) => bookings ?? [],
  );

  const availableDurations = BOOKING_DURATIONS.filter((duration) => {
    const candidateEnd = addMinutes(startsAt, duration);

    if (candidateEnd > workingDayEnd) {
      return false;
    }

    const hasConflict = cachedBookings.some((booking) => {
      if (booking.roomId !== bookingDraft.roomId) {
        return false;
      }

      const existingStart = new Date(booking.startsAt);
      const existingEnd = new Date(booking.endsAt);

      return existingStart < candidateEnd && existingEnd > startsAt;
    });

    return !hasConflict;
  });

  const initialDuration = availableDurations[0];

  if (initialDuration === undefined) {
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
          aria-labelledby="booking-modal-title"
        >
          <header className={styles.header}>
            <div>
              <h2 className={styles.title} id="booking-modal-title">
                Slot unavailable
              </h2>

              <p className={styles.description}>
                This time slot is no longer available.
              </p>
            </div>

            <button
              className={styles.closeButton}
              type="button"
              aria-label="Close booking modal"
              onClick={handleClose}
            >
              <IoClose />
            </button>
          </header>

          <footer className={styles.footer}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={handleClose}
            >
              Close
            </button>
          </footer>
        </section>
      </div>,
      document.body,
    );
  }

  const initialValues: BookingFormValues = {
    title: "",
    duration: initialDuration,
  };

  const bookingValidationSchema = Yup.object({
    title: Yup.string()
      .trim()
      .required("Title is required")
      .max(100, "Title must be 100 characters or fewer"),

    duration: Yup.number()
      .oneOf(availableDurations, "Selected duration is unavailable")
      .required("Duration is required"),
  });

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
        aria-labelledby="booking-modal-title"
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title} id="booking-modal-title">
              Create booking
            </h2>

            <p className={styles.description}>Enter the booking details.</p>
          </div>

          <button
            className={styles.closeButton}
            type="button"
            aria-label="Close booking modal"
            disabled={createBookingMutation.isPending}
            onClick={handleClose}
          >
            <IoClose />
          </button>
        </header>

        <Formik
          initialValues={initialValues}
          validationSchema={bookingValidationSchema}
          onSubmit={(values) => {
            const endsAt = addMinutes(startsAt, values.duration);

            createBookingMutation.mutate({
              title: values.title.trim(),
              roomId: bookingDraft.roomId,
              startsAt: startsAt.toISOString(),
              endsAt: endsAt.toISOString(),
            });
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => {
            const endsAt = addMinutes(startsAt, Number(values.duration));

            return (
              <Form className={styles.form}>
                <div className={styles.details}>
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

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="booking-title">
                    Title
                  </label>

                  <input
                    className={`${styles.input} ${
                      touched.title && errors.title ? styles.inputError : ""
                    }`}
                    id="booking-title"
                    name="title"
                    type="text"
                    autoComplete="off"
                    placeholder="For example: Project discussion"
                    value={values.title}
                    disabled={createBookingMutation.isPending}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />

                  {touched.title && errors.title && (
                    <p className={styles.error}>{errors.title}</p>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="booking-duration">
                    Duration
                  </label>

                  <select
                    className={`${styles.select} ${
                      touched.duration && errors.duration
                        ? styles.inputError
                        : ""
                    }`}
                    id="booking-duration"
                    name="duration"
                    value={values.duration}
                    disabled={createBookingMutation.isPending}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  >
                    {availableDurations.map((duration) => (
                      <option key={duration} value={duration}>
                        {formatDuration(duration)}
                      </option>
                    ))}
                  </select>

                  {touched.duration && errors.duration && (
                    <p className={styles.error}>{errors.duration}</p>
                  )}
                </div>

                <footer className={styles.footer}>
                  <button
                    className={styles.cancelButton}
                    type="button"
                    disabled={createBookingMutation.isPending}
                    onClick={handleClose}
                  >
                    Cancel
                  </button>

                  <button
                    className={styles.submitButton}
                    type="submit"
                    disabled={createBookingMutation.isPending}
                  >
                    {createBookingMutation.isPending
                      ? "Creating..."
                      : "Create booking"}
                  </button>
                </footer>
              </Form>
            );
          }}
        </Formik>
      </section>
    </div>,
    document.body,
  );
}
