import Joi from "joi";

export const getBookingsQuerySchema = Joi.object({
  start: Joi.string().isoDate().required(),
  end: Joi.string().isoDate().required(),
}).unknown(false);

export const createBookingSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
  roomId: Joi.string().uuid().required(),
  startsAt: Joi.string().isoDate().required(),
  endsAt: Joi.string().isoDate().required(),
}).unknown(false);

export const updateBookingTitleSchema = Joi.object({
  title: Joi.string().trim().min(1).max(100).required(),
}).unknown(false);

export const bookingParamsSchema = Joi.object({
  bookingId: Joi.string().uuid().required(),
}).unknown(false);

export const getMyBookingsQuerySchema = Joi.object({
  status: Joi.string().valid("upcoming", "past").required(),

  page: Joi.when("status", {
    is: "past",
    then: Joi.string()
      .pattern(/^[1-9]\d*$/)
      .default("1"),
    otherwise: Joi.forbidden(),
  }),

  limit: Joi.when("status", {
    is: "past",
    then: Joi.string()
      .pattern(/^[1-9]\d*$/)
      .default("6"),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);
