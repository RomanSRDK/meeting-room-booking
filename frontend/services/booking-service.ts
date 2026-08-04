import { apiClient } from "@/lib/api-client";
import type {
  Booking,
  BookingResponse,
  BookingsResponse,
  CreateBookingPayload,
  MyBooking,
  MyBookingsResponse,
} from "@/types/booking";

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

export async function getMyBookings(): Promise<MyBooking[]> {
  const response = await apiClient.get<MyBookingsResponse>("/bookings/my");

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
