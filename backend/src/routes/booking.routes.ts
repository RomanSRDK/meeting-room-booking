import { Router } from "express";
import {
  createBooking,
  deleteBooking,
  getBookings,
  getMyBookings,
} from "../controllers/booking.controller.ts";
import { validateQuery } from "../middlewares/validate-query.middleware.ts";
import {
  bookingParamsSchema,
  createBookingSchema,
  getBookingsQuerySchema,
} from "../validations/booking.validation.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";
import { validateBody } from "../middlewares/validate-body.middleware.ts";
import { validateParams } from "../middlewares/validate-params.middleware.ts";

export const bookingRouter = Router();

bookingRouter.get("/my", authenticate, getMyBookings);

bookingRouter.get("/", validateQuery(getBookingsQuerySchema), getBookings);

bookingRouter.post(
  "/",
  authenticate,
  validateBody(createBookingSchema),
  createBooking,
);

bookingRouter.delete(
  "/:bookingId",
  authenticate,
  validateParams(bookingParamsSchema),
  deleteBooking,
);
