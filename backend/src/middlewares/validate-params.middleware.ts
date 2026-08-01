import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema } from "joi";
import createHttpError from "http-errors";

export function validateParams(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.params, {
      abortEarly: false,
      convert: false,
    });

    if (error) {
      next(
        createHttpError(
          400,
          error.details.map((detail) => detail.message).join(", "),
        ),
      );
      return;
    }

    next();
  };
}
