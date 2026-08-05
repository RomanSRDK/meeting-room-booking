import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getBookings, getMyBookings } from "@/services/booking-service";

type BookingsQueryParams = {
  start: string;
  end: string;
};

export const PAST_BOOKINGS_PAGE_SIZE = 6;

const UPCOMING_BOOKINGS_LIMIT = 50;

export function bookingsQueryOptions({ start, end }: BookingsQueryParams) {
  return queryOptions({
    queryKey: ["bookings", start, end],

    queryFn: () =>
      getBookings({
        start,
        end,
      }),
  });
}

export const myUpcomingBookingsQueryOptions = queryOptions({
  queryKey: ["bookings", "my", "upcoming"],

  queryFn: () =>
    getMyBookings({
      status: "upcoming",
      page: 1,
      limit: UPCOMING_BOOKINGS_LIMIT,
    }),
});

export const myPastBookingsInfiniteQueryOptions = infiniteQueryOptions({
  queryKey: ["bookings", "my", "past"],

  queryFn: ({ pageParam }) =>
    getMyBookings({
      status: "past",
      page: pageParam,
      limit: PAST_BOOKINGS_PAGE_SIZE,
    }),

  initialPageParam: 1,

  getNextPageParam: (lastPage) => {
    if (!lastPage.pagination.hasNextPage) {
      return undefined;
    }

    return lastPage.pagination.page + 1;
  },
});
