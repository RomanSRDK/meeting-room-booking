import { apiClient } from "@/lib/api-client";
import type { Room, RoomsResponse } from "@/types/room";

export async function getRooms(): Promise<Room[]> {
  const response = await apiClient.get<RoomsResponse>("/rooms");

  return response.data.data;
}
