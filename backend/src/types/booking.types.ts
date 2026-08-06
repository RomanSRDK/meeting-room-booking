export type GetBookingsQuery = {
  start: string;
  end: string;
};

export type MyBookingsStatus = "upcoming" | "past";

export type GetMyBookingsQuery = {
  status: MyBookingsStatus;
  page?: string;
  limit?: string;
};

export type GetMyBookingsInput = {
  userId: string;
  status: MyBookingsStatus;
  page: number;
  limit: number;
};

export type CreateBookingBody = {
  title: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
};

export type CreateBookingInput = {
  title: string;
  roomId: string;
  userId: string;
  startsAt: Date;
  endsAt: Date;
};

export type UpdateBookingTitleBody = {
  title: string;
};

export type UpdateBookingTitleInput = {
  bookingId: string;
  userId: string;
  title: string;
};

export type BookingParams = {
  bookingId: string;
};
