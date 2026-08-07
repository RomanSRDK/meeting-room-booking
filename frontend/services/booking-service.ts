import { apiClient } from "@/lib/api-client";
import type {
  Booking,
  BookingResponse,
  BookingsResponse,
  CreateBookingPayload,
  MyBooking,
  MyPastBookingsResponse,
  MyUpcomingBookingsResponse,
  PaginatedMyBookings,
  UpdateBookingTitlePayload,
} from "@/types/booking";

type GetBookingsParams = {
  start: string;
  end: string;
};

type GetMyPastBookingsParams = {
  page: number;
  limit: number;
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

export async function getMyUpcomingBookings(): Promise<MyBooking[]> {
  const response = await apiClient.get<MyUpcomingBookingsResponse>(
    "/bookings/my",
    {
      params: {
        status: "upcoming",
      },
    },
  );

  return response.data.data;
}

export async function getMyPastBookings({
  page,
  limit,
}: GetMyPastBookingsParams): Promise<PaginatedMyBookings> {
  const response = await apiClient.get<MyPastBookingsResponse>("/bookings/my", {
    params: {
      status: "past",
      page,
      limit,
    },
  });

  return response.data.data;
}

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const response = await apiClient.post<BookingResponse>("/bookings", payload);

  return response.data.data;
}

export async function deleteBooking(bookingId: string): Promise<void> {
  await apiClient.delete(`/bookings/${bookingId}`);
}

export async function updateBookingTitle({
  bookingId,
  title,
}: UpdateBookingTitlePayload): Promise<Booking> {
  const response = await apiClient.patch<BookingResponse>(
    `/bookings/${bookingId}/title`,
    {
      title,
    },
  );

  return response.data.data;
}
