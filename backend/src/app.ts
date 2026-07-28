import express, { type Express, type Request, type Response } from "express";
import helmet from "helmet";
import cors from "cors";

export const app: Express = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});
