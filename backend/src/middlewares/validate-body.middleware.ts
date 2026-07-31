import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import type { ObjectSchema } from "joi";

export function validateBody(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const message = error.details.map((detail) => detail.message).join(", ");

      return next(createHttpError(400, message));
    }

    req.body = value;

    return next();
  };
}
