import createHttpError from "http-errors";
import type { NextFunction, Request, Response } from "express";
import type { LoginUserInput, RegisterUserInput } from "../types/auth.types.ts";
import {
  clearAccessTokenCookie,
  setAccessTokenCookie,
} from "../utils/auth-cookie.ts";
import {
  getCurrentUserService,
  loginUserService,
  registerUserService,
} from "../services/auth.service.ts";
import { createAccessToken } from "../utils/jwt.ts";

export async function registerUser(
  req: Request<object, object, RegisterUserInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await registerUserService(req.body);

    res.status(201).json({
      status: 201,
      message: "User registered successfully",
      data: user,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function loginUser(
  req: Request<object, object, LoginUserInput>,
  res: Response,
  next: NextFunction,
) {
  try {
    const user = await loginUserService(req.body);

    const accessToken = createAccessToken({
      userId: user.id,
    });

    setAccessTokenCookie(res, accessToken);

    res.status(200).json({
      status: 200,
      message: "Login successful",
      data: user,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export async function getCurrentUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      throw createHttpError(401, "Authentication required");
    }

    const user = await getCurrentUserService(req.userId);

    res.status(200).json({
      status: 200,
      message: "Current user retrieved successfully",
      data: user,
    });
  } catch (error: unknown) {
    next(error);
  }
}

export function logoutUser(_req: Request, res: Response) {
  clearAccessTokenCookie(res);

  res.status(200).json({
    status: 200,
    message: "Logout successful",
  });
}
