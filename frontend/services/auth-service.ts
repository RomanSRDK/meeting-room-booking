import { apiClient } from "@/lib/api-client";
import type { CurrentUserResponse, User } from "@/types/auth";

export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<CurrentUserResponse>("/auth/me");

  return response.data.data;
}
