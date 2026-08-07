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

export type GetMyUpcomingBookingsInput = {
  userId: string;
  status: "upcoming";
};

export type GetMyPastBookingsInput = {
  userId: string;
  status: "past";
  page: number;
  limit: number;
};

export type GetMyBookingsInput =
  GetMyUpcomingBookingsInput | GetMyPastBookingsInput;

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
