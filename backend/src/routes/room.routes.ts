import { Router } from "express";

import { getRooms } from "../controllers/room.controller.ts";

export const roomRouter = Router();

roomRouter.get("/", getRooms);
