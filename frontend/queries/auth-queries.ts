import { queryOptions } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/auth-service";

export const currentUserQueryOptions = queryOptions({
  queryKey: ["auth", "me"],
  queryFn: getCurrentUser,
  staleTime: 5 * 60 * 1000,
});
