import type { NextFunction, Request, Response } from "express";

import { getRoomsService } from "../services/room.service.ts";

export async function getRooms(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const rooms = await getRoomsService();

    res.status(200).json({
      status: 200,
      message: "Rooms retrieved successfully",
      data: rooms,
    });
  } catch (error: unknown) {
    next(error);
  }
}
