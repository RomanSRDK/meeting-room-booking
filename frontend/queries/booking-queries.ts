import { queryOptions } from "@tanstack/react-query";

import { getBookings, getMyBookings } from "@/services/booking-service";

type BookingsQueryParams = {
  start: string;
  end: string;
};

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

export const myBookingsQueryOptions = queryOptions({
  queryKey: ["bookings", "my"],
  queryFn: getMyBookings,
});
