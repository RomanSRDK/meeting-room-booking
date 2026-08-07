export type BookingAuthor = {
  id: string;
  name: string;
};

export type Booking = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  roomId: string;
  user: BookingAuthor;
};

export type MyBookingRoom = {
  id: string;
  name: string;
  floor: number;
  capacity: number;
};

export type MyBooking = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  room: MyBookingRoom;
};

export type BookingsResponse = {
  status: number;
  message: string;
  data: Booking[];
};

export type BookingResponse = {
  status: number;
  message: string;
  data: Booking;
};

export type MyBookingsStatus = "upcoming" | "past";

export type MyBookingsPagination = {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
};

export type PaginatedMyBookings = {
  items: MyBooking[];
  pagination: MyBookingsPagination;
};

export type MyUpcomingBookingsResponse = {
  status: number;
  message: string;
  data: MyBooking[];
};

export type MyPastBookingsResponse = {
  status: number;
  message: string;
  data: PaginatedMyBookings;
};

export type CreateBookingPayload = {
  title: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
};

export type UpdateBookingTitlePayload = {
  bookingId: string;
  title: string;
};
