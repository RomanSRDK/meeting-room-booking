import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";
import { prisma } from "./lib/prisma.ts";

export const app: Express = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/database", async (_req: Request, res: Response) => {
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json({
    status: 200,
    database: "connected",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
