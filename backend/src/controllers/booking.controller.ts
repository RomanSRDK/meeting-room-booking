import type { NextFunction, Request, Response } from "express";
import {
  createBookingService,
  deleteBookingService,
  getBookingsService,
  getMyBookingsService,
  updateBookingTitleService,
} from "../services/booking.service.ts";
import type {
  BookingParams,
  CreateBookingBody,
  GetBookingsQuery,
  GetMyBookingsQuery,
  UpdateBookingTitleBody,
} from "../types/booking.types.ts";
import { validateBookingTime } from "../utils/validate-booking-time.ts";
import createHttpError from "http-errors";

export async function getBookings(
  req: Request<object, object, object, GetBookingsQuery>,
  res: Response,
  next: NextFunction,
) {
  try {
    const start = new Date(req.query.start);
    const end = new Date(req.query.end);

    if (start >= end) {
      throw createHttpError(400, "Start date must be earlier than end date");
    }

    const bookings = await getBookingsService({
      start,
      end,
    });

    res.status(200).json({
      status: 200,
      message: "Bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function createBooking(
  req: Request<object, object, CreateBookingBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      throw createHttpError(401, "Authentication required");
    }

    const startsAt = new Date(req.body.startsAt);
    const endsAt = new Date(req.body.endsAt);

    validateBookingTime({
      startsAt,
      endsAt,
    });

    const booking = await createBookingService({
      title: req.body.title,
      roomId: req.body.roomId,
      userId: req.userId,
      startsAt,
      endsAt,
    });

    res.status(201).json({
      status: 201,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getMyBookings(
  req: Request<object, object, object, GetMyBookingsQuery>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      throw createHttpError(401, "Authentication required");
    }

    const page = Number(req.query.page ?? "1");
    const limit = Number(req.query.limit ?? "6");

    if (limit > 50) {
      throw createHttpError(400, "Limit must be less than or equal to 50");
    }

    const bookings = await getMyBookingsService({
      userId: req.userId,
      status: req.query.status,
      page,
      limit,
    });

    res.status(200).json({
      status: 200,
      message: "User bookings retrieved successfully",
      data: bookings,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function deleteBooking(
  req: Request<BookingParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      throw createHttpError(401, "Authentication required");
    }

    const deletedBooking = await deleteBookingService(
      req.params.bookingId,
      req.userId,
    );

    res.status(200).json({
      status: 200,
      message: "Booking deleted successfully",
      data: deletedBooking,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function updateBookingTitle(
  req: Request<BookingParams, object, UpdateBookingTitleBody>,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      throw createHttpError(401, "Authentication required");
    }

    const updatedBooking = await updateBookingTitleService({
      bookingId: req.params.bookingId,
      userId: req.userId,
      title: req.body.title,
    });

    res.status(200).json({
      status: 200,
      message: "Booking title updated successfully",
      data: updatedBooking,
    });
  } catch (error: unknown) {
    next(error);
  }
}
