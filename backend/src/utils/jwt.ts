import jwt from "jsonwebtoken";
import type { StringValue } from "ms";
import type { AccessTokenPayload } from "../types/auth.types.ts";

export function createAccessToken(payload: AccessTokenPayload) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const expiresIn =
    (process.env.JWT_EXPIRES_IN as StringValue | undefined) ?? "1d";

  return jwt.sign(payload, secret, {
    expiresIn,
  });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  const decoded = jwt.verify(token, secret);

  if (typeof decoded === "string" || typeof decoded.userId !== "string") {
    throw new Error("Invalid access token payload");
  }

  return {
    userId: decoded.userId,
  };
}
