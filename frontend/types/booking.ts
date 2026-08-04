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

export type BookingsResponse = {
  status: number;
  message: string;
  data: Booking[];
};
