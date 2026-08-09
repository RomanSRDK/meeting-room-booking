import { queryOptions } from "@tanstack/react-query";
import { getRooms } from "@/services/room-service";

export const roomsQueryOptions = queryOptions({
  queryKey: ["rooms"],
  queryFn: getRooms,
  staleTime: 5 * 60 * 1000,
});
