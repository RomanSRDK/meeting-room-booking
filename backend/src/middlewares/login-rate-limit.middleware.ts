import { rateLimit } from "express-rate-limit";

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  handler: (_req, res) => {
    res.status(429).json({
      status: 429,
      message: "Too many login attempts",
    });
  },
});
