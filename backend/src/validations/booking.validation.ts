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

  page: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .default("1"),

  limit: Joi.string()
    .pattern(/^[1-9]\d*$/)
    .default("6"),
}).unknown(false);
