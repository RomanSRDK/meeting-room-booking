export type GetBookingsQuery = {
  start: string;
  end: string;
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

export type BookingParams = {
  bookingId: string;
};
