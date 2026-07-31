import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import { prisma } from "./lib/prisma.ts";
import { authRouter } from "./routes/auth.routes.ts";
import { errorHandler } from "./middlewares/error.middleware.ts";

export const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);

app.get("/database", async (_req: Request, res: Response) => {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    status: 200,
    database: "connected",
  });
});

app.use(errorHandler);
