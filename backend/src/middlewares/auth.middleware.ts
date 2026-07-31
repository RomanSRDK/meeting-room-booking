import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

import { verifyAccessToken } from "../utils/jwt.ts";

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const accessToken = req.cookies.accessToken;

  if (typeof accessToken !== "string") {
    return next(createHttpError(401, "Authentication required"));
  }

  try {
    const payload = verifyAccessToken(accessToken);

    req.userId = payload.userId;

    return next();
  } catch {
    return next(createHttpError(401, "Invalid or expired access token"));
  }
}
