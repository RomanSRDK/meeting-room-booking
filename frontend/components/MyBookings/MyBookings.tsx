"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useUserTimeZone } from "@/hooks/useUserTimeZone";
import { isOfficeTimeZone } from "@/lib/date-time";
import {
  myPastBookingsInfiniteQueryOptions,
  myUpcomingBookingsQueryOptions,
} from "@/queries/booking-queries";
import { deleteBooking } from "@/services/booking-service";
import { MyBookingsHeader } from "./MyBookingsHeader";
import { PastBookingsSection } from "./PastBookingsSection";
import { UpcomingBookingsSection } from "./UpcomingBookingsSection";
import styles from "./MyBookings.module.css";

type ApiErrorResponse = {
  message?: string;
};

export function MyBookings() {
  const queryClient = useQueryClient();

  const userTimeZone = useUserTimeZone();

  const {
    data: upcomingBookingsData,
    isPending: isUpcomingBookingsPending,
    isError: isUpcomingBookingsError,
  } = useQuery(myUpcomingBookingsQueryOptions);

  const {
    data: pastBookingsData,
    isPending: isPastBookingsPending,
    isError: isPastBookingsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery(myPastBookingsInfiniteQueryOptions);

  const now = useCurrentTime();

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

  if (isUpcomingBookingsPending || isPastBookingsPending) {
    return <p className={styles.state}>Loading bookings...</p>;
  }

  if (isUpcomingBookingsError || isPastBookingsError) {
    return <p className={styles.state}>Failed to load bookings</p>;
  }

  const upcomingBookings = upcomingBookingsData;

  const upcomingBookingsCount = upcomingBookings.length;

  const pastBookings = pastBookingsData.pages.flatMap((page) => page.items);

  const pastBookingsCount =
    pastBookingsData.pages[0]?.pagination.totalItems ?? 0;

  const userUsesOfficeTimeZone = isOfficeTimeZone(userTimeZone);

  function handleCancelBooking(bookingId: string, bookingTitle: string) {
    const isConfirmed = window.confirm(`Cancel booking "${bookingTitle}"?`);

    if (!isConfirmed) {
      return;
    }

    deleteBookingMutation.mutate(bookingId);
  }

  function handleLoadMore() {
    void fetchNextPage();
  }

  return (
    <section className={styles.page}>
      <MyBookingsHeader
        upcomingBookingsCount={upcomingBookingsCount}
        userTimeZone={userTimeZone}
        userUsesOfficeTimeZone={userUsesOfficeTimeZone}
        now={now}
      />

      <UpcomingBookingsSection
        bookings={upcomingBookings}
        now={now}
        userTimeZone={userTimeZone}
        userUsesOfficeTimeZone={userUsesOfficeTimeZone}
        isDeletePending={deleteBookingMutation.isPending}
        deletingBookingId={deleteBookingMutation.variables}
        onCancel={handleCancelBooking}
      />

      <PastBookingsSection
        bookings={pastBookings}
        totalCount={pastBookingsCount}
        userTimeZone={userTimeZone}
        userUsesOfficeTimeZone={userUsesOfficeTimeZone}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMore={handleLoadMore}
      />
    </section>
  );
}
