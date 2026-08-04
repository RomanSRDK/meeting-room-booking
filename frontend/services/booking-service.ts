import { apiClient } from "@/lib/api-client";
import type { Booking, BookingsResponse } from "@/types/booking";

type GetBookingsParams = {
  start: string;
  end: string;
};

export async function getBookings({
  start,
  end,
}: GetBookingsParams): Promise<Booking[]> {
  const response = await apiClient.get<BookingsResponse>("/bookings", {
    params: {
      start,
      end,
    },
  });

  return response.data.data;
}
