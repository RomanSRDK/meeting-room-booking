import {
  keepPreviousData,
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";

import {
  getBookings,
  getMyPastBookings,
  getMyUpcomingBookings,
} from "@/services/booking-service";

type BookingsQueryParams = {
  start: string;
  end: string;
};

export const PAST_BOOKINGS_PAGE_SIZE = 6;

export function bookingsQueryOptions({ start, end }: BookingsQueryParams) {
  return queryOptions({
    queryKey: ["bookings", start, end],

    queryFn: () =>
      getBookings({
        start,
        end,
      }),
    placeholderData: keepPreviousData,
  });
}

export const myUpcomingBookingsQueryOptions = queryOptions({
  queryKey: ["bookings", "my", "upcoming"],

  queryFn: getMyUpcomingBookings,
});

export const myPastBookingsInfiniteQueryOptions = infiniteQueryOptions({
  queryKey: ["bookings", "my", "past"],

  queryFn: ({ pageParam }) =>
    getMyPastBookings({
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
