"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { addMinutes } from "date-fns";
import { Form, Formik } from "formik";
import toast from "react-hot-toast";
import * as Yup from "yup";

import { Modal } from "@/components/Modal/Modal";
import {
  formatInOfficeTimeZone,
  formatInUserTimeZone,
  getOfficeWorkdayEnd,
  getTimeZoneOffsetLabel,
  getUserTimeZone,
  isOfficeTimeZone,
  OFFICE_TIME_ZONE,
} from "@/lib/date-time";
import { roomsQueryOptions } from "@/queries/room-queries";
import { createBooking } from "@/services/booking-service";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeBookingModal } from "@/store/slices/schedule-slice";
import type { Booking } from "@/types/booking";

import styles from "./BookingModal.module.css";

const BOOKING_DURATIONS = [30, 60, 90, 120, 150, 180, 210, 240];

type BookingFormValues = {
  title: string;
  duration: number;
};

type ApiErrorResponse = {
  message?: string;
};

function subscribeToTimeZone() {
  return () => {};
}

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

  const { data: rooms } = useQuery(roomsQueryOptions);

  const userTimeZone = useSyncExternalStore(
    subscribeToTimeZone,
    getUserTimeZone,
    () => OFFICE_TIME_ZONE,
  );

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

    onError: async (error: AxiosError<ApiErrorResponse>) => {
      await queryClient.invalidateQueries({
        queryKey: ["bookings"],
      });

      if (error.response?.status === 409) {
        const message =
          error.response?.status === 409
            ? "Oops! This time is no longer available. Please choose another time"
            : "Something went wrong. Please try again";
        toast(message, {
          icon: "😞",
        });

        dispatch(closeBookingModal());
      }
    },
  });

  function handleClose() {
    if (createBookingMutation.isPending) {
      return;
    }

    dispatch(closeBookingModal());
  }

  if (!isBookingModalOpen || !bookingDraft) {
    return null;
  }

  const selectedRoom = rooms?.find((room) => room.id === bookingDraft.roomId);

  const startsAt = new Date(bookingDraft.startsAt);
  const workingDayEnd = getOfficeWorkdayEnd(startsAt);

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
    return null;
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

  const userUsesOfficeTimeZone = isOfficeTimeZone(userTimeZone);

  const userTimeZoneOffset = getTimeZoneOffsetLabel(userTimeZone, startsAt);

  const officeTimeZoneOffset = getTimeZoneOffsetLabel(
    OFFICE_TIME_ZONE,
    startsAt,
  );

  return (
    <Modal
      title="Create booking"
      description={selectedRoom ? `Room: ${selectedRoom.name}` : undefined}
      closeButtonLabel="Close booking modal"
      closeDisabled={createBookingMutation.isPending}
      onClose={handleClose}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={bookingValidationSchema}
        onSubmit={(values) => {
          const duration = Number(values.duration);
          const endsAt = addMinutes(startsAt, duration);

          createBookingMutation.mutate({
            title: values.title.trim(),
            roomId: bookingDraft.roomId,
            startsAt: startsAt.toISOString(),
            endsAt: endsAt.toISOString(),
          });
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => {
          const duration = Number(values.duration);
          const endsAt = addMinutes(startsAt, duration);

          return (
            <Form className={styles.form}>
              <div className={styles.details}>
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
                    {formatInOfficeTimeZone(startsAt, "dd.MM.yyyy, HH:mm")}–
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
                    touched.duration && errors.duration ? styles.inputError : ""
                  }`}
                  id="booking-duration"
                  name="duration"
                  value={values.duration}
                  disabled={createBookingMutation.isPending}
                  onBlur={handleBlur}
                  onChange={handleChange}
                >
                  {availableDurations.map((durationOption) => (
                    <option key={durationOption} value={durationOption}>
                      {formatDuration(durationOption)}
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
    </Modal>
  );
}
