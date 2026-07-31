import type { ErrorRequestHandler } from "express";
import { isHttpError } from "http-errors";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (isHttpError(error)) {
    res.status(error.statusCode).json({
      status: error.statusCode,
      message: error.message,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    status: 500,
    message: "Internal server error",
  });
};
