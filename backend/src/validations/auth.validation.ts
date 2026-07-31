import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "any.required": "Name is required",
  }),

  email: Joi.string().trim().lowercase().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email is invalid",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).max(72).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must contain at least 8 characters",
    "string.max": "Password must contain at most 72 characters",
    "any.required": "Password is required",
  }),
}).unknown(false);

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Email is invalid",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
}).unknown(false);
