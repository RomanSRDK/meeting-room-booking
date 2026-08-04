import { queryOptions } from "@tanstack/react-query";

import { getBookings } from "@/services/booking-service";

type BookingsQueryOptionsParams = {
  start: string;
  end: string;
};

export function bookingsQueryOptions({
  start,
  end,
}: BookingsQueryOptionsParams) {
  return queryOptions({
    queryKey: ["bookings", start, end],
    queryFn: () =>
      getBookings({
        start,
        end,
      }),
  });
}
