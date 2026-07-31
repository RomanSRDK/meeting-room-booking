import type { CookieOptions, Response } from "express";

const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
const ACCESS_TOKEN_COOKIE_MAX_AGE = 24 * 60 * 60 * 1000;

function getAccessTokenCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/",
  };
}

export function setAccessTokenCookie(res: Response, accessToken: string): void {
  res.cookie(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    ...getAccessTokenCookieOptions(),
    maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
  });
}

export function clearAccessTokenCookie(res: Response): void {
  res.clearCookie(ACCESS_TOKEN_COOKIE_NAME, getAccessTokenCookieOptions());
}
